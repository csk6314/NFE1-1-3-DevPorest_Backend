const Comment = require("../models/Comment");

exports.getCommentsByPortfolioId = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const comments = await Comment.find({ portfolioID: portfolioId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createComment = async (req, res) => {
  const { portfolioId } = req.params;
  const { content } = req.body;
  const { userinfo } = req; // 인증된 사용자 정보

  const newComment = new Comment({
    content,
    userID: userinfo.id, // 인증된 사용자 ID 사용
    portfolioID: portfolioId,
  });

  try {
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const { userinfo } = req; // 인증된 사용자 정보

  try {
    // 댓글 존재 여부 및 작성자 확인
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 댓글 작성자와 현재 사용자가 일치하는지 확인
    if (comment.userID !== userinfo.id) {
      return res.status(403).json({ message: "댓글 수정 권한이 없습니다." });
    }

    // 댓글 업데이트
    comment.content = content;
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { userinfo } = req; // 인증된 사용자 정보

  try {
    // 댓글 존재 여부 및 작성자 확인
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 댓글 작성자와 현재 사용자가 일치하는지 확인
    if (comment.userID !== userinfo.id) {
      return res.status(403).json({ message: "댓글 삭제 권한이 없습니다." });
    }

    // 댓글 삭제
    await Comment.findByIdAndDelete(commentId);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
