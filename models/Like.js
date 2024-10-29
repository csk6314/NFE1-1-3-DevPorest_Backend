const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const likeSchema = new Schema({
  portfolioID: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Portfolio",
  },
  userID: {
    type: String,
    required: true,
  },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
