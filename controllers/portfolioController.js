const Portfolio = require("../models/Portfolio");

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

module.exports = {
  getAllPortfolios,
  createPortfolio,
};
