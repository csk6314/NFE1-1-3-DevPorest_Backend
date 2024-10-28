const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobGroupSchema = new Schema({
  job: {
    type: String,
    required: true,
    unique: true,
  },
});

const JobGroup = mongoose.model("JobGroup", jobGroupSchema);
module.exports = JobGroup;
