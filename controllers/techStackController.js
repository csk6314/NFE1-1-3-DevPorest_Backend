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

module.exports = {
  createTechStack,
  getAllTechStacks,
};
