const Like = require("../models/Like");
const Portfolio = require("../models/Portfolio");
const mongoose = require("mongoose");

// 포트폴리오 목록 조회
const getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find()
      .sort({ createdAt: -1 }) // 최신순 정렬
      .select("-__v"); // __v 필드 제외하고 클라이언트에 보여줌

    res.status(200).json({
      success: true,
      count: portfolios.length,
      data: portfolios,
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

    res.status(200).json({
      success: true,
      data: portfolio,
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
      images,
      tags,
      techStack,
      jobGroup,
      thumbnailImage,
      userID,
    } = req.body;

    const portfolio = new Portfolio({
      title,
      contents,
      images,
      tags,
      techStack,
      jobGroup,
      thumbnailImage,
      userID,
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

    // 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 포트폴리오 ID입니다.",
      });
    }

    const portfolio = await Portfolio.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: "해당 ID의 포트폴리오를 찾을 수 없습니다.",
      });
    }

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

    // 유효한 ObjectId인지 확인
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "유효하지 않은 포트폴리오 ID입니다.",
      });
    }

    const portfolio = await Portfolio.findByIdAndDelete(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: "해당 ID의 포트폴리오를 찾을 수 없습니다.",
      });
    }

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

module.exports = {
  getAllPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioById,
  toggleLike,
};
