const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const techStackSchema = new Schema({
  skill: {
    type: String,
    required: true,
    unique: true,
  },
  bgColor: {
    type: String,
    default: "#201E50",
  },
  textColor: {
    type: String,
    default: "#FFFFFF",
  },
  useNum: {
    type: Number,
    default: 0,
  },
  jobCode: {
    type: Schema.Types.ObjectId,
    ref: "JobGroup",
    required: true,
  },
});

techStackSchema.index({ skill: 1 });
techStackSchema.index({ jobCode: 1 });

const TechStack = mongoose.model("TechStack", techStackSchema);

module.exports = TechStack;
