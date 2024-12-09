const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "posts",
    required: true,
  },
  content: String,
});

module.exports = mongoose.model("comments", commentsSchema);