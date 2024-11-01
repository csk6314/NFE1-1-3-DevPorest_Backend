const JobGroup = require("../models/JobGroup");
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
    const techStacks = await TechStack.aggregate([
      {
        $sort: {
          skill: 1,
        },
      },
      {
        $project: {
          __v: 0,
          _id: 0,
        },
      },
    ]);

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
          totalCount: { $size: "$portfolios" },
        },
      },
      {
        $project: {
          portfolios: 0,
          __v: 0,
          _id: 0,
        },
      },
      {
        $sort: {
          totalCount: -1,
        },
      },
    ];

    if (req.query.job) {
      const jobGroup = await JobGroup.find({ job: req.query.job });

      if (jobGroup.length < 1) {
        throw new Error("잘못된 직무 명을 입력하셨습니다.");
      }
      const jobCode = jobGroup[0]._id;

      pipelines = [
        {
          $match: {
            jobCode: new mongoose.Types.ObjectId(jobCode + ""),
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
