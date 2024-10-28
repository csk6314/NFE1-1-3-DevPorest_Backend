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

module.exports = { createJobGroup };
