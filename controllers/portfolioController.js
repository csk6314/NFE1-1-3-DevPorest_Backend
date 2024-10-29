const Like = require("../models/Like");
const Portfolio = require("../models/Portfolio");
const mongoose = require("mongoose");

// 포트폴리오 목록 조회
const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find()
      .sort({ createdAt: -1 }) // 최신순 정렬
      .select("-__v"); // __v 필드 제외하고 클라이언트에 보여줌

    /*
     * 추가적인 DetailData 삽입
     * 일단 likeCount만 추가
     * CommentCount 추가 해야함
     **/
    const portfoliosWithDetails = await Promise.all(
      portfolios.map(async (portfolio) => {
        const likeCount = await Like.countDocuments({
          portfolioID: portfolio._id,
        });
        return {
          ...portfolio.toObject(),
          likeCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfoliosWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "포트폴리오 목록을 가져오는데 실패했습니다.",
    });
  }
};

// 포트폴리오 상세 조회
const getPortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    // 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 포트폴리오 ID입니다.",
      });
    }

    const portfolio = await Portfolio.findById(id).select("-__v");

    if (!portfolio) {
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

    res.status(200).json({
      success: true,
      data: {
        ...portfolio.toObject(),
        like,
        likeCount,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "포트폴리오 조회에 실패했습니다.",
    });
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
    } = req.body;

    const userID = req.userinfo.id;

    // URL 유효성 검사 (선택사항)
    const validateUrl = (url) => {
      return (
        url.startsWith("https://") && url.includes(process.env.AWS_S3_BUCKET)
      );
    };

    if (thumbnailImage && !validateUrl(thumbnailImage)) {
      throw new Error("유효하지 않은 썸네일 이미지 URL입니다.");
    }

    if (images && Array.isArray(images)) {
      const invalidUrls = images.filter((url) => !validateUrl(url));
      if (invalidUrls.length > 0) {
        throw new Error("유효하지 않은 이미지 URL이 포함되어 있습니다.");
      }
    }

    const portfolio = new Portfolio({
      title,
      contents,
      images,
      tags,
      techStack,
      jobGroup,
      thumbnailImage,
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
      data: portfolio,
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
    const likeCount = (await Like.find({ portfolioID })).length;
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

// 포트폴리오 검색
const searchPortfolios = async (req, res) => {
  try {
    const { type, keyword } = req.params;
    const { sort = "latest" } = req.query; // 정렬 옵션: 'latest' 또는 'popular'

    // 타입과 키워드 처리 - 하이픈이나 공백인 경우 빈 문자열로 처리
    const searchType = type === "-" || type === " " ? "" : type;
    const searchKeyword = keyword === "-" || keyword === " " ? "" : keyword;

    // 검색 조건 설정
    const matchStage = {};

    // 기술 스택 검색 조건
    if (searchType) {
      matchStage.techStack = searchType; // 문자열 배열에서 직접 검색
    }

    // 키워드 검색 조건 (제목에서 검색, 대소문자 구분 없이)
    if (searchKeyword) {
      matchStage.title = new RegExp(searchKeyword, "i");
    }

    // Aggregation Pipeline 구성
    const pipeline = [
      { $match: matchStage },
      {
        // Like 컬렉션과 조인하여 좋아요 수 계산
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "portfolioID",
          as: "likes",
        },
      },
      {
        // 좋아요 수를 계산하여 새로운 필드 추가
        $addFields: {
          likeCount: { $size: "$likes" },
        },
      },
      // jobGroup 정보 조회
      {
        $lookup: {
          from: "jobgroups",
          localField: "jobGroup",
          foreignField: "_id",
          as: "jobGroupInfo",
        },
      },
      {
        $unwind: {
          path: "$jobGroupInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // 필요한 필드만 선택
      {
        $project: {
          title: 1,
          contents: 1,
          view: 1,
          images: 1,
          tags: 1,
          techStack: 1, // 기술 스택은 문자열 배열로 직접 표시
          createdAt: 1,
          thumbnailImage: 1,
          userID: 1,
          likeCount: 1,
          jobGroup: "$jobGroupInfo", // jobGroup 정보 매핑
        },
      },
    ];

    // 정렬 조건 추가
    if (sort === "popular") {
      pipeline.push({ $sort: { likeCount: -1, createdAt: -1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const portfolios = await Portfolio.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: portfolios.length,
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
    const skip = (page - 1) * limit;

    // 해당 유저가 생성한 포트폴리오 수 조회
    const totalCount = await Portfolio.countDocuments({ userID: userid });

    // 페이지네이션이 적용된 포트폴리오 목록 조회
    const portfolios = await Portfolio.find({ userID: userid })
      .sort({ createdAt: -1 })
      .select("-__v")
      .skip(skip)
      .limit(limit);

    // Like와 join하여 해당 포트폴리오의 좋아요 수 계산
    const portfoliosWithLikes = await Promise.all(
      portfolios.map(async (portfolio) => {
        const likeCount = await Like.countDocuments({
          portfolioID: portfolio._id,
        });
        return {
          ...portfolio.toObject(), // Mongoose 문서 객체를 일반 JavaScript 객체로 변환
          likeCount,
        };
      })
    );

    // 페이지네이션 메타데이터 계산
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
      },
      data: portfoliosWithLikes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error retrieving user portfolios",
    });
  }
};

module.exports = {
  getAllPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioById,
  toggleLike,
  searchPortfolios,
  uploadSingleImage,
  uploadMultipleImages,
  getUserPortfolios,
};
