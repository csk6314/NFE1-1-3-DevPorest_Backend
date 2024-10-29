const Comment = require("../models/Comment");

exports.getCommentsByPortfolioId = async (req, res) => {
  try {
    const { portfolioId } = req.params;
    const { page = 1, limit = 10 } = req.query; // 기본값: 1페이지, 15개씩

    // 쿼리 파라미터는 문자열로 오기때문에, 문자열을 숫자로 변환.
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    // 유효성 검사
    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        message: "페이지와 limit는 1 이상이어야 합니다.",
      });
    }

    // 전체 댓글 수 조회
    const totalComments = await Comment.countDocuments({
      portfolioID: portfolioId,
    });

    // 페이지네이션 적용하여 댓글 조회
    const comments = await Comment.find({ portfolioID: portfolioId }) // 주어진 포트폴리오 ID에 해당하는 댓글만 조회
      .sort({ createdAt: -1 }) // 최신 댓글이 먼저 오도록 내림차순 정렬
      .skip((pageNum - 1) * limitNum) // 불러올 댓글의 시작 지점을 설정. 해당 페이지에 해당하는 댓글만 조회하도록 함.
      .limit(limitNum) // 한 번에 가져올 최대 댓글 수 제한
      .exec(); // 쿼리를 실행하고 결과를 반환

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalComments / limitNum);

    res.json({
      comments,
      currentPage: pageNum,
      totalPages,
      totalComments,
      hasNextPage: pageNum < totalPages, // 마지막 페이지인지 확인하기에 용이
      hasPrevPage: pageNum > 1,
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
