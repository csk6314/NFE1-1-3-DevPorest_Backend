const JobGroup = require("../models/JobGroup");
const mongoose = require("mongoose");

const createJobGroup = async (req, res) => {
  try {
    const { job } = req.body;

    const jobGroup = await JobGroup.create({ job });

    res.status(201).json({ success: true, data: jobGroup });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "jobGroup 생성에 실패했습니다.",
    });
  }
};

const getAllJobGroup = async (req, res) => {
  try {
    const jobGroup = await JobGroup.find().sort({ job: 1 }).select("-__v");

    res.status(200).json({
      success: true,
      data: jobGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "직무 정보를 가져오는데 실패했습니다.",
    });
  }
};

module.exports = { createJobGroup, getAllJobGroup };
