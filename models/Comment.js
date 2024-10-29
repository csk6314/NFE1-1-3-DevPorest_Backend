const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  // _id : 자동생성됨
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now, // UTC 기준으로 저장, 조회 시 한국 시간으로 변환 필요
  },
  userID: {
    type: String,
    required: true,
    ref: "User", // User 모델과 연결
  },
  portfolioID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Portfolio", // Portfolio 모델과 연결
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
