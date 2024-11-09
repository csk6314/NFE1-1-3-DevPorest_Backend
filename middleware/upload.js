const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3"); // v3으로 전환
const path = require("path");

// S3 클라이언트 초기화 (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 파일 필터 (이미지 파일만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드 가능합니다!"), false);
  }
};

// Multer S3 설정
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,

    key: function (req, file, cb) {
      try {
        const usage = req.query.usage ?? "profile";
        const userID = req.userinfo.id;

        //유저 프로필 사진 처리
        if (usage === "profile") {
          cb(null, `${userID}/profile.png`);
          return;
        }

        const portfolioID = req.params.id;

        if (!portfolioID) {
          throw new Error("No Portfolio ID");
        }
        //포트폴리오 썸네일 처리
        if (usage === "thumbnail") {
          cb(null, `${userID}/${portfolioID}/thumbnail.png`);
          return;
        }

        //포트폴리오 컨텐트 이미지 처리
        if (usage === "content") {
          const idx = file.originalname.split(".")[0];
          cb(null, `${userID}/${portfolioID}/${idx}.png`);
        }
      } catch (error) {
        cb(error);
      }
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

module.exports = upload;
