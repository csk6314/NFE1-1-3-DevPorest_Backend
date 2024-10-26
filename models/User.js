const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  intro: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  links: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now, // UTC 기준으로 저장, 조회 시 한국 시간으로 변환 필요
  },
  techStack: [{ type: Schema.Types.ObjectId, ref: "TechStack" }],
  jobGroup: {
    type: Schema.Types.ObjectId,
    ref: "JobGroup",
    required: true,
  },
});

// 1은 오름차순, -1은 내림차순 정렬을 의미합니다
userSchema.index({ userID: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
