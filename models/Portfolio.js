const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const portfolioSchema = new Schema(
  {
    // _id : 자동생성됨
    title: {
      type: String,
      required: true,
    },
    contents: {
      type: String,
      required: true,
    },
    view: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: [String], // 배열 형태로 본문 이미지 URL을 저장
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now, // UTC 기준으로 저장, 조회 시 한국 시간으로 변환 필요
    },
    techStack: {
      type: [String],
      required: true,
    },
    jobGroup: {
      type: Number,
      required: true,
    },
    thumbnailImage: {
      type: String,
      default: null,
    },
    userID: {
      type: String,
      required: true,
      ref: "User", // User 모델을 참조
    },
  },
  {
    timestamps: true,
  }
);

// 1은 오름차순, -1은 내림차순 정렬을 의미합니다
portfolioSchema.index({ userID: 1 }); // 특정 사용자의 모든 포트폴리오 검색 시 성능 향상
portfolioSchema.index({ jobGroup: 1 }); // 특정 직군의 포트폴리오 목록 검색 시 성능 향상
portfolioSchema.index({ createdAt: -1 }); // 최신순 정렬 시 성능 향상

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

module.exports = Portfolio;
