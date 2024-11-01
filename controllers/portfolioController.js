const { incrementViewCount } = require("../utils/viewCounter");
const {
  createSearchPipeline,
  createPaginationMetadata,
} = require("../pipeline/portfolioSearchPipeline");
const Like = require("../models/Like");
const Portfolio = require("../models/Portfolio");
const mongoose = require("mongoose");

// 기존의 getAllPortfolios와 searchPortfolios를 통합한 새로운 검색 api
const searchPortfolios = async (req, res) => {
  try {
    const {
      jobGroup = "all",
      techStacks = "",
      searchType = "title", // default : title
      keyword = "",
      sort = "latest",
      page = 1,
      limit = 15,
    } = req.query;

    // 검색 파라미터 정제
    const searchParams = {
      jobGroup,
      techStacks: techStacks ? techStacks.split(",") : [],
      searchType,
      keyword,
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    // 실제 검색 실행
    const pipeline = createSearchPipeline(searchParams);

    // 전체 문서 수 계산을 위한 카운트 파이프라인
    const countPipeline = [...pipeline];

    const [countResult] = await Portfolio.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);

    const totalCount = countResult ? countResult.total : 0;
    const portfolios = await Portfolio.aggregate(pipeline);
    const pagination = createPaginationMetadata(totalCount, page, limit);

    res.status(200).json({
      success: true,
      pagination,
      data: portfolios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "포트폴리오 검색에 실패했습니다.",
    });
  }
};

const uploadSingleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "이미지 파일이 없습니다.",
      });
    }

    // multer-s3는 자동으로 S3에 업로드하고 location을 제공
    const imageUrl = req.file.location;

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "이미지 업로드에 실패했습니다.",
    });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "이미지 파일이 없습니다.",
      });
    }

    // multer-s3는 자동으로 S3에 업로드하고 각 파일의 location을 제공
    const imageUrls = req.files.map((file) => file.location);

    res.status(200).json({
      success: true,
      data: {
        urls: imageUrls,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "이미지 업로드에 실패했습니다.",
    });
  }
};

const getUserPortfolios = async (req, res) => {
  try {
    const { userid } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;

    // 검색 파라미터 생성
    const searchParams = {
      searchType: "user",
      keyword: userid,
      page,
      limit,
    };

    // 파이프라인 생성
    const pipeline = createSearchPipeline(searchParams);

    // 전체 문서 수 계산을 위한 카운트 파이프라인
    const countPipeline = [...pipeline];

    const [countResult] = await Portfolio.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);

    const totalCount = countResult ? countResult.total : 0;
    const portfolios = await Portfolio.aggregate(pipeline);
    const pagination = createPaginationMetadata(totalCount, page, limit);

    res.status(200).json({
      success: true,
      pagination,
      data: portfolios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "유저의 포트폴리오를 가져오지 못했습니다.",
    });
  }
};

// 포트폴리오 상세 조회
const getPortfolioById = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;

    // 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 포트폴리오 ID입니다.",
      });
    }

    // 세션 초기화를 명시적으로 수행
    if (!req.session.viewedPortfolios) {
      req.session.viewedPortfolios = {};
    }

    // 실제 세션 객체 전달
    await incrementViewCount(id, req.session, session);

    // 검색 파이프라인을 사용하여 포트폴리오 조회 (pagination은 제외)
    const pipeline = createSearchPipeline({
      searchType: "_id", // 필수 파라미터
      keyword: id, // ID로 직접 검색
      page: 1,
      limit: 1, // 단일 결과만 필요
    });

    // ObjectId로 직접 매칭하는 단계를 파이프라인 초입에 추가
    pipeline.unshift({
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    });

    const [portfolio] = await Portfolio.aggregate(pipeline);

    if (!portfolio) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: "해당 ID의 포트폴리오를 찾을 수 없습니다.",
      });
    }

    // 좋아요 상태 및 카운트 처리
    const portfolioLikes = await Like.find({ portfolioID: id });
    const likeCount = portfolioLikes.length;

    let like = false;

    //로그인 한 상태
    if (req.userinfo) {
      const { id: userID } = req.userinfo;
      // 유저 ID가 일치하는 좋아요가 있으면 좋아요 상태 ON
      if (portfolioLikes.find((doc) => doc.userID === userID)) {
        like = true;
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {
        ...portfolio,
        like,
        likeCount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message || "포트폴리오 조회에 실패했습니다.",
    });
  } finally {
    session.endSession();
  }
};

// 새 포트폴리오 생성
const createPortfolio = async (req, res) => {
  try {
    const {
      title,
      contents,
      images, // S3 URL 배열
      tags,
      techStack,
      jobGroup,
      thumbnailImage, // S3 URL
      links,
    } = req.body;

    const userID = req.userinfo.id;

    const portfolio = new Portfolio({
      title,
      contents,
      images,
      tags,
      techStack,
      jobGroup,
      thumbnailImage,
      links,
      userID, // 인증된 사용자의 ID 사용
    });

    const savedPortfolio = await portfolio.save();

    res.status(201).json({
      success: true,
      data: savedPortfolio,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "포트폴리오 생성에 실패했습니다.",
    });
  }
};

// 포트폴리오 수정
const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.userinfo.id;

    // 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 포트폴리오 ID입니다.",
      });
    }

    // 포트폴리오 소유자 확인
    const existingPortfolio = await Portfolio.findById(id);

    if (!existingPortfolio) {
      return res.status(404).json({
        success: false,
        error: "해당 ID의 포트폴리오를 찾을 수 없습니다.",
      });
    }

    // 포트폴리오 소유자가 아닌 경우
    if (existingPortfolio.userID !== userID) {
      return res.status(403).json({
        success: false,
        error: "포트폴리오를 수정할 권한이 없습니다.",
      });
    }

    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "포트폴리오가 성공적으로 수정되었습니다.",
      _id: portfolio._id,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "포트폴리오 수정에 실패했습니다.",
    });
  }
};

// 포트폴리오 삭제
const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.userinfo.id;

    // 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 포트폴리오 ID입니다.",
      });
    }

    // 포트폴리오 소유자 확인
    const existingPortfolio = await Portfolio.findById(id);

    if (!existingPortfolio) {
      return res.status(404).json({
        success: false,
        error: "해당 ID의 포트폴리오를 찾을 수 없습니다.",
      });
    }

    // 포트폴리오 소유자가 아닌 경우
    if (existingPortfolio.userID !== userID) {
      return res.status(403).json({
        success: false,
        error: "포트폴리오를 삭제할 권한이 없습니다.",
      });
    }

    await Portfolio.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "포트폴리오가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "포트폴리오 삭제에 실패했습니다.",
    });
  }
};

// 좋아요 토글 기능
const toggleLike = async (req, res) => {
  const { id: portfolioID } = req.params;
  const { id: userID } = req.userinfo;

  try {
    const likeCount = await Like.countDocuments({ portfolioID });
    const like = await Like.findOne({ portfolioID, userID });

    //좋아요 없는 경우 => 좋아요 생성
    if (!like) {
      await Like.create({ portfolioID, userID });
      return res.json({ like: true, likeCount: likeCount + 1 });
    }

    //좋아요 있는 경우 => 좋아요 삭제
    await Like.deleteOne({ portfolioID, userID });
    res.json({ like: false, likeCount: likeCount - 1 });
  } catch (error) {
    res.status(500).json({ message: "서버 에러" });
  }
};

const getUserLikePortfolios = async (req, res) => {
  try {
    const { userid } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;

    // 먼저 유저가 좋아요한 포트폴리오 ID들을 가져옴
    const likedPortfolioIds = await Like.distinct("portfolioID", {
      userID: userid,
    });

    // 검색 파라미터 생성
    const searchParams = {
      searchType: "likedByUser",
      keyword: userid,
      page,
      limit,
    };

    // 파이프라인 생성
    const pipeline = createSearchPipeline(searchParams);

    // 전체 문서 수 계산을 위한 카운트 파이프라인
    const countPipeline = [...pipeline];

    const [countResult] = await Portfolio.aggregate([
      ...countPipeline,
      { $count: "total" },
    ]);

    const totalCount = countResult
      ? countResult.total
      : likedPortfolioIds.length;
    const portfolios = await Portfolio.aggregate(pipeline);
    const pagination = createPaginationMetadata(totalCount, page, limit);

    return res.status(200).json({
      success: true,
      pagination,
      data: portfolios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "유저의 좋아요한 포트폴리오를 가져오지 못했습니다.",
    });
  }
};

module.exports = {
  searchPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioById,
  toggleLike,
  uploadSingleImage,
  uploadMultipleImages,
  getUserPortfolios,
  getUserLikePortfolios,
};
