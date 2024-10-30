const Portfolio = require("../models/Portfolio");
const TechStack = require("../models/TechStack");
const mongoose = require("mongoose");

const createTechStack = async (req, res) => {
  const { skill, bgColor, textColor, jobCode, adminCode } = req.body;

  if (!adminCode || adminCode !== "1234") {
    return res.status(401).json({ message: "관리자 권한이 없습니다." });
  }

  try {
    const techStack = await TechStack.create({
      skill,
      bgColor,
      textColor,
      jobCode,
    });

    res.json(techStack);
  } catch (err) {
    res.status(500).json({ message: "기술스택 생성 중 오류가 발생했습니다." });
  }
};

const getAllTechStacks = async (req, res) => {
  try {
    const techStacks = await TechStack.find().sort({ skill: 1 }).select("-__v");

    res.status(200).json({
      success: true,
      data: techStacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "기술스택 목록을 가져오는데 실패했습니다.",
    });
  }
};

const getTechStackStatistic = async (req, res) => {
  try {
    let pipelines = [
      {
        $lookup: {
          from: "portfolios",
          localField: "skill",
          foreignField: "techStack",
          as: "portfolios",
        },
      },
      {
        $addFields: {
          total_count: { $size: "$portfolios" },
        },
      },
      {
        $project: {
          portfolios: 0,
          __v: 0,
        },
      },
      {
        $sort: {
          total_count: -1,
        },
      },
    ];

    if (req.query.jobcode) {
      pipelines = [
        {
          $match: {
            jobCode: new mongoose.Types.ObjectId(req.query.jobcode + ""),
          },
        },
        ...pipelines,
      ];
    }

    const techStack = await TechStack.aggregate([pipelines]);

    res.status(200).json({
      success: true,
      data: techStack,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "기술스택 통계를 가져오는데 실패했습니다.",
    });
  }
};

module.exports = {
  createTechStack,
  getAllTechStacks,
  getTechStackStatistic,
};
