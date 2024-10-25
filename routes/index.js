const express = require("express");
const router = express.Router();

// 라우트 파일들을 import
const portfolioRoutes = require("./portfolioRoutes");

// API 라우트 설정
router.use("/portfolios", portfolioRoutes);

module.exports = router;
