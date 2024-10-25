require("dotenv").config();

const { swaggerUi, specs } = require("./swagger");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 8000;

//Router
const authRoutes = require("./routes/authRoute");

// 데이터베이스 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

// 미들웨어 설정
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN,
      "http://localhost:5173",
      "http://localhost:8000",
    ],
    credentials: true,
  })
);
app.use(express.json()); // JSON 파싱
app.use(cookieParser()); // 쿠키 파싱
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs)); // Swagger UI를 /api-docs 경로에 라우팅

// 기본 라우트 설정
app.get("/", (req, res) => {
  res.send("Express 서버가 실행 중입니다.");
});

// 추가적인 라우터를 추가하려면, routes 폴더에 파일을 추가하고, 이곳에서 불러오면 됨
app.use("/api/auth", authRoutes);

// 존재하지 않는 라우트에 대한 처리
app.use("*", (req, res) => {
  res.status(404).json({ message: "요청하신 페이지를 찾을 수 없습니다." });
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 실행 중입니다...`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN}`);
});
