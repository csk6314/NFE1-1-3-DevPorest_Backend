const Comment = require("../models/Comment");

exports.getCommentsByPortfolioId = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 전체 댓글 수 조회
    const totalComments = await Comment.countDocuments({
      portfolioID: portfolioId,
    });

    // 페이지네이션 적용하여 댓글 조회
    const comments = await Comment.find({ portfolioID: portfolioId }) // 주어진 포트폴리오 ID에 해당하는 댓글만 조회
      .sort({ createdAt: -1 }) // 최신 댓글이 먼저 오도록 내림차순 정렬
      .skip(skip) // 불러올 댓글의 시작 지점을 설정. 해당 페이지에 해당하는 댓글만 조회하도록 함.
      .limit(limit) // 한 번에 가져올 최대 댓글 수 제한
      .exec(); // 쿼리를 실행하고 결과를 반환

    // 페이지네이션 메타데이터 계산
    const totalPages = Math.ceil(totalComments / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage,
        hasPrevPage,
        limit,
      },
      data: comments,
    });
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
