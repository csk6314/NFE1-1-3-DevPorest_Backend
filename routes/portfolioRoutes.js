const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController.js");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// 전체 조회는 인증이 필요없으므로 미들웨어 적용하지 않음
router.get("/search", portfolioController.searchPortfolios); // GET /api/portfolios/search
router.get("/:id", portfolioController.getPortfolioById); // GET /api/portfolios/:id

// 생성, 수정, 삭제는 인증된 사용자만 가능하도록 auth 미들웨어 적용 + 좋아요
router.post("/", auth, portfolioController.createPortfolio); // POST /api/portfolios
router.put("/:id", auth, portfolioController.updatePortfolio); // PUT /api/portfolios/:id
router.delete("/:id", auth, portfolioController.deletePortfolio); // DELETE /api/portfolios/:id
router.post(
  "/upload/:id",
  auth,
  upload.single("image"),
  portfolioController.uploadSingleImage
);
router.post(
  "/uploads/:id",
  auth,
  upload.array("images", 5),
  portfolioController.uploadMultipleImages
);
router.post("/:id/like", auth, portfolioController.toggleLike);

// GET /api/portfolios/user/:userid
router.get("/user/:userid", portfolioController.getUserPortfolios);

// GET /api/portfolios/like/:userid
router.get("/like/:userid", portfolioController.getUserLikePortfolios);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Portfolios
 *   description: 포트폴리오 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Portfolio:
 *       type: object
 *       required:
 *         - title
 *         - contents
 *         - userID
 *       properties:
 *         title:
 *           type: string
 *           description: 포트폴리오 제목
 *         contents:
 *           type: string
 *           description: 포트폴리오 내용
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: 이미지 URL 배열
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 태그 배열
 *         techStack:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               skill:
 *                 type: string
 *               bgColor:
 *                 type: string
 *               textColor:
 *                 type: string
 *               jobCode:
 *                 type: string
 *           description: 사용된 기술 스택 정보 배열
 *         jobGroup:
 *           type: string
 *           description: 직무 카테고리명
 *           example: "frontend"
 *         thumbnailImage:
 *           type: string
 *           description: 썸네일 이미지 URL(단일)
 *         userID:
 *           type: string
 *           description: 포트폴리오 소너자 ID
 *         likeCount:
 *           type: integer
 *           description: 좋아요 수
 */

/**
 * @swagger
 * /api/portfolios/search:
 *   get:
 *     summary: 포트폴리오 검색 API (직무군, 기술 스택, 키워드 검색 및 정렬, 페이지네이션)
 *     description: |
 *       다양한 조건으로 포트폴리오를 검색합니다.
 *       - 직무군, 기술 스택, 키워드를 조합하여 검색이 가능합니다.
 *       - 검색 조건이 없는 경우 전체 포트폴리오가 조회됩니다.
 *       - 검색어는 영문(대소문자 구분 없음), 한글, 공백을 포함할 수 있습니다.
 *       - 정렬은 최신순(latest), 조회수순(views), 좋아요순(likes)으로 가능합니다.
 *         - latest: 생성일 기준 내림차순 (기본값)
 *         - views: 조회수 기준 내림차순, 동일한 경우 생성일 내림차순
 *         - likes: 좋아요 수 내림차순, 동일한 경우 생성일 내림차순
 *       - 페이지네이션이 적용되어 있습니다.
 *       - 검색 결과는 기술 스택 정보와 직무 그룹 정보가 포함됩니다.
 *     tags: [Portfolios]
 *     parameters:
 *       - in: query
 *         name: jobGroup
 *         schema:
 *           type: string
 *         required: false
 *         description: 직무군 필터 (all, Frontend, Backend 등)
 *       - in: query
 *         name: techStacks
 *         schema:
 *           type: string
 *         required: false
 *         description: |
 *           콤마로 구분된 기술 스택 (예: React, Node.js)
 *       - in: query
 *         name: searchType
 *         schema:
 *           type: string
 *           enum: [user, title, tag]
 *           default: title
 *         description: |
 *           검색 유형
 *           - user: 사용자ID 또는 사용자명으로 검색
 *           - title: 제목으로 검색 (기본값)
 *           - tag: 태그로 검색
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: |
 *           검색 키워드
 *           searchType에 따라 다음과 같이 검색
 *           - user: 사용자ID 또는 사용자명에서 검색
 *           - title: 제목에서 검색
 *           - tag: 태그에서 검색
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, views, likes]
 *           default: latest
 *         description: |
 *           정렬 방식
 *           - latest: 최신순 (기본값)
 *           - views: 조회수순
 *           - likes: 좋아요순
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 조회할 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 15
 *         description: 한 페이지당 포트폴리오 수
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       example: 42
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                     limit:
 *                       type: integer
 *                       example: 15
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         example: "AI 기반 React 프로젝트"
 *                       contents:
 *                         type: string
 *                         example: "프로젝트 상세 내용..."
 *                       view:
 *                         type: integer
 *                         example: 150
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["image1.jpg", "image2.jpg"]
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["AI", "웹개발"]
 *                       techStack:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             skill:
 *                               type: string
 *                               example: "React"
 *                             bgColor:
 *                               type: string
 *                               example: "#61DAFB"
 *                             textColor:
 *                               type: string
 *                               example: "#000000"
 *                             jobCode:
 *                               type: string
 *                               example: "FE"
 *                       userInfo:
 *                         type: object
 *                         properties:
 *                           userID:
 *                             type: string
 *                             example: "user123"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           profileImage:
 *                             type: string
 *                             example: "profile.jpg"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00.000Z"
 *                       thumbnailImage:
 *                         type: string
 *                         example: "thumbnail.jpg"
 *                       likeCount:
 *                         type: integer
 *                         example: 42
 *                       jobGroup:
 *                         type: string
 *                         example: "Frontend"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "유효하지 않은 직무군입니다."
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "포트폴리오 검색에 실패했습니다."
 */

/**
 * @swagger
 * /api/portfolios/{id}:
 *   get:
 *     summary: 포트폴리오 상세 조회
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID (24자리 16진수 ObjectId)
 *     responses:
 *       200:
 *         description: 포트폴리오 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     title:
 *                       type: string
 *                       example: "My Portfolio"
 *                     contents:
 *                       type: string
 *                       example: "Portfolio description"
 *                     view:
 *                       type: number
 *                       example: 42
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["image1.jpg", "image2.jpg"]
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["web", "frontend"]
 *                     techStack:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           skill:
 *                             type: string
 *                             example: "React"
 *                           bgColor:
 *                             type: string
 *                             example: "#61DAFB"
 *                           textColor:
 *                             type: string
 *                             example: "#000000"
 *                           jobCode:
 *                             type: string
 *                             example: "FE"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     thumbnailImage:
 *                       type: string
 *                       example: "thumbnail.jpg"
 *                     userInfo:
 *                       type: object
 *                       properties:
 *                         userID:
 *                           type: string
 *                           example: "user123"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         profileImage:
 *                           type: string
 *                           example: "profile.jpg"
 *                     like:
 *                       type: boolean
 *                       example: false
 *                     likeCount:
 *                       type: number
 *                       example: 15
 *                     jobGroup:
 *                       type: string
 *                       example: "Frontend"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 유효하지 않은 포트폴리오 ID입니다.
 *       404:
 *         description: 포트폴리오를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 해당 ID의 포트폴리오를 찾을 수 없습니다.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Portfolio:
 *       type: object
 *       required:
 *         - title
 *         - contents
 *         - images
 *         - techStack
 *         - jobGroup
 *         - links
 *         - userID
 *       properties:
 *         title:
 *           type: string
 *           description: 포트폴리오 제목
 *           example: "3년차 프론트엔드 개발자 김철수입니다"
 *         contents:
 *           type: string
 *           description: 포트폴리오 내용
 *           example: "안녕하세요! 사용자 경험을 중요하게 생각하는 프론트엔드 개발자 김철수입니다..."
 *         view:
 *           type: number
 *           description: 조회수
 *           default: 0
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: 포트폴리오 이미지 URL 배열
 *           example: ["profile-main.jpg", "workplace.jpg", "presentation.jpg"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 태그 목록
 *           example: ["프론트엔드", "React", "TypeScript", "3년차", "핀테크"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 생성 일시
 *         techStack:
 *           type: array
 *           items:
 *             type: string
 *           description: 사용 기술 스택
 *           example: ["React", "TypeScript", "Next.js"]
 *         jobGroup:
 *           type: string
 *           description: 직군 ID
 *           example: "671f4eaa1f6112721acacbf8"
 *         links:
 *           type: array
 *           items:
 *             type: string
 *           description: 관련 링크 목록 (GitHub, 블로그 등)
 *           example: ["https://github.com/username", "https://velog.io/@username"]
 *         thumbnailImage:
 *           type: string
 *           description: 썸네일 이미지 URL
 *           example: "profile-thumbnail.jpg"
 *         userID:
 *           type: string
 *           description: 사용자 ID
 *           example: "user555"
 *
 * @swagger
 * /api/portfolios:
 *   post:
 *     summary: 새 포트폴리오 생성 (인증 필요)
 *     security:
 *       - cookieAuth: []
 *     tags: [Portfolios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Portfolio'
 *     responses:
 *       201:
 *         description: 포트폴리오 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "포트폴리오가 성공적으로 생성되었습니다."
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Portfolio'
 *                     - type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                           description: MongoDB ObjectId
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-11-01T03:01:58.498Z"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 포트폴리오 생성에 실패했습니다.
 */

/**
 * @swagger
 * /api/portfolios/{id}:
 *   put:
 *     summary: 포트폴리오 수정 (인증 필요)
 *     security:
 *       - cookieAuth: []
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID (24자리 16진수 ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Portfolio'
 *     responses:
 *       200:
 *         description: 포트폴리오 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "포트폴리오가 성공적으로 수정되었습니다."
 *                 _id:
 *                   type: string
 *                   example: "507f1f77bcf86cd799439011"
 *                   description: MongoDB ObjectId
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 포트폴리오를 수정할 권한이 없습니다.
 *       404:
 *         description: 포트폴리오를 찾을 수 없음
 *
 *   delete:
 *     summary: 포트폴리오 삭제 (인증 필요)
 *     security:
 *       - cookieAuth: []
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID
 *     responses:
 *       200:
 *         description: 포트폴리오 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 포트폴리오가 성공적으로 삭제되었습니다.
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 인증이 필요합니다
 *       403:
 *         description: 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 포트폴리오를 삭제할 권한이 없습니다.
 *       404:
 *         description: 포트폴리오를 찾을 수 없음
 */
/**
 * @swagger
 * /api/portfolios/{id}/like:
 *   post:
 *     summary: 포트폴리오 좋아요 (토글)
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID
 *     responses:
 *       201:
 *         description: 포트폴리오 좋아요 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 like:
 *                   type: boolean
 *                   example: true
 *                 likeCount:
 *                   type: number
 *                   example: 0
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버 에러
 */
/**
 * @swagger
 * /api/portfolios/upload/{id}:
 *   post:
 *     summary: 단일 이미지 업로드 (인증 필요)
 *     description: |
 *       단일 이미지 파일을 AWS S3에 업로드합니다.
 *       - 지원 형식: jpeg, jpg, png, gif
 *       - 최대 파일 크기: 5MB
 *       - 인증된 사용자만 사용 가능
 *     tags: [Portfolios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID
 *       - in: query
 *         name: usage
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용 용도
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: file
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: 업로드된 이미지의 S3 URL
 *       400:
 *         description: 잘못된 요청 (이미지 없음 또는 잘못된 형식)
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */

/**
 * @swagger
 * /api/portfolios/uploads/{id}:
 *   post:
 *     summary: 다중 이미지 업로드 (인증 필요)
 *     description: |
 *       최대 5개의 이미지 파일을 AWS S3에 업로드합니다.
 *       - 지원 형식: jpeg, jpg, png, gif
 *       - 파일당 최대 크기: 5MB
 *       - 최대 업로드 개수: 5개
 *       - 인증된 사용자만 사용 가능
 *     tags: [Portfolios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID
 *       - in: query
 *         name: usage
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용 용도
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: file
 *                   format: binary
 *                 description: 업로드할 이미지 파일들
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     urls:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 업로드된 이미지들의 S3 URL 배열
 *       400:
 *         description: 잘못된 요청 (이미지 없음, 잘못된 형식 또는 개수 초과)
 *       401:
 *         description: 인증 실패
 *       500:
 *         description: 서버 에러
 */
/**
 * @swagger
 * /api/portfolios/user/{userid}:
 *   get:
 *     summary: 특정 사용자의 포트폴리오 목록 조회
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: 포트폴리오 소유자 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 조회할 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 15
 *         description: 한 페이지당 포트폴리오 수
 *     responses:
 *       200:
 *         description: 사용자 포트폴리오 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       example: 42
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                     limit:
 *                       type: integer
 *                       example: 15
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         example: "My Portfolio"
 *                       contents:
 *                         type: string
 *                         example: "Portfolio description"
 *                       view:
 *                         type: number
 *                         example: 42
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["image1.jpg", "image2.jpg"]
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["web", "frontend"]
 *                       techStack:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             skill:
 *                               type: string
 *                               example: "React"
 *                             bgColor:
 *                               type: string
 *                               example: "#61DAFB"
 *                             textColor:
 *                               type: string
 *                               example: "#000000"
 *                             jobCode:
 *                               type: string
 *                               example: "FE"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       thumbnailImage:
 *                         type: string
 *                         example: "thumbnail.jpg"
 *                       userInfo:
 *                         type: object
 *                         properties:
 *                           userID:
 *                             type: string
 *                             example: "user123"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           profileImage:
 *                             type: string
 *                             example: "profile.jpg"
 *                       likeCount:
 *                         type: number
 *                         example: 15
 *                       jobGroup:
 *                         type: string
 *                         example: "Frontend"
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 유저의 포트폴리오를 가져오지 못했습니다.
 *
 * /api/portfolios/like/{userid}:
 *   get:
 *     summary: 특정 사용자가 좋아요한 포트폴리오 목록 조회
 *     tags: [Portfolios]
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 조회할 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 15
 *         description: 한 페이지당 포트폴리오 수
 *     responses:
 *       200:
 *         description: 사용자가 좋아요한 포트폴리오 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       example: 42
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                     limit:
 *                       type: integer
 *                       example: 15
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       title:
 *                         type: string
 *                         example: "My Portfolio"
 *                       contents:
 *                         type: string
 *                         example: "Portfolio description"
 *                       view:
 *                         type: number
 *                         example: 42
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["image1.jpg", "image2.jpg"]
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["web", "frontend"]
 *                       techStack:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             skill:
 *                               type: string
 *                               example: "React"
 *                             bgColor:
 *                               type: string
 *                               example: "#61DAFB"
 *                             textColor:
 *                               type: string
 *                               example: "#000000"
 *                             jobCode:
 *                               type: string
 *                               example: "FE"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       thumbnailImage:
 *                         type: string
 *                         example: "thumbnail.jpg"
 *                       userInfo:
 *                         type: object
 *                         properties:
 *                           userID:
 *                             type: string
 *                             example: "user123"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           profileImage:
 *                             type: string
 *                             example: "profile.jpg"
 *                       likeCount:
 *                         type: number
 *                         example: 15
 *                       jobGroup:
 *                         type: string
 *                         example: "Frontend"
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: 유저의 좋아요한 포트폴리오를 가져오지 못했습니다.
 */
