const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  // 쿠키에서 토큰 가져오기
  const token = req.headers["authorization"].split(" ");

  if (token[0] !== "Bearer" || token.length > 2) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }

  // 토큰이 없는 경우
  if (!token[1]) {
    return res.status(401).json({ message: "인증이 필요합니다" });
  }

  try {
    // 토큰 검증
    const verified = jwt.verify(token[1], secret);

    // 검증된 사용자 정보를 request 객체에 저장
    req.userinfo = verified;

    // 다음 미들웨어로 진행
    next();
  } catch (err) {
    // 토큰이 유효하지 않은 경우
    res.status(401).json({ message: "유효하지 않은 토큰입니다" });
  }
};

module.exports = auth;
