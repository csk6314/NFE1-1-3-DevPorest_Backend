const express = require("express");
const router = express.Router();

//controller
const userController = require("../controllers/userController");
const { uploadSingleImage } = require("../controllers/portfolioController");

//middleware
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/user", auth, userController.getMyUserInfo);

router.get("/user/:userid", userController.getUserInfo);

router.get("/popular", userController.getPopularUserProfile);

router.post("/", auth, userController.registerUserProfile);

router.put("/", auth, userController.modifyUserProfile);

router.post("/upload", auth, upload.single("image"), uploadSingleImage);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 포트폴리오 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userID:
 *           type: string
 *           description: 유저 아이디
 *         name:
 *           type: string
 *           description: 유저 이름
 *         email:
 *           type: string
 *           description: 유저 이메일
 *         intro:
 *           type: string
 *           description: 유저 소개
 *         phoneNumber:
 *           type: string
 *           description: 유저 휴대폰 번호
 *         links:
 *           type: array
 *           items:
 *             type: string
 *           description: 유저 외부 링크
 *         techStack:
 *           type: array
 *           items:
 *             type: string
 *           description: 유저 기술 스택 배열
 *         jobGroup:
 *           type: string
 *           description: 유저 직무
 *         profileImage:
 *           type: string
 *           description: 유저 프로필 이미지 URL
 */

/**
 * @swagger
 * /api/users/user:
 *   get:
 *     summary: 내 프로필 조회
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 내 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         techStack:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - type: object
 *                                 properties:
 *                               - $ref: '#/components/schemas/TechStack'
 *                         totalLikes:
 *                           type: number
 *                           example: 0
 *                         createdAt:
 *                           type: Date
 *                           example: "date"
 *                         newUser:
 *                           type: boolean
 *                           example: false
 *       200-1:
 *         description: 내 프로필 조회 성공 (신규유저)
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
 *                     userID:
 *                       type: string
 *                       example: string
 *                     name:
 *                       type: string
 *                       example: string
 *                     profileImage:
 *                       type: string
 *                       example: string
 *                     newUser:
 *                       type: boolean
 *                       example: false
 *       404:
 *         description: 유저를 찾을 수 없음
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
 *                   example: 해당 ID의 유저를 찾을 수 없습니다.
 *       500:
 *         description: 유저를 찾을 수 없음
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
 *                   example: 서버 에러
 */

/**
 * @swagger
 * /api/users/user/{userid}:
 *   get:
 *     summary: 유저 프로필 조회
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userid
 *         required: true
 *         schema:
 *           type: string
 *         description: 유저 ID
 *     responses:
 *       200:
 *         description: 유저 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         techStack:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - type: object
 *                                 properties:
 *                               - $ref: '#/components/schemas/TechStack'
 *                         totalLikes:
 *                           type: number
 *                           example: 0
 *                         createdAt:
 *                           type: Date
 *                           example: "date"
 *       404:
 *         description: 유저를 찾을 수 없음
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
 *                   example: 해당 ID의 유저를 찾을 수 없습니다.
 *       500:
 *         description: 유저를 찾을 수 없음
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
 *                   example: 서버 에러
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 유저 프로필 등록
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: 유저 프로필 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *                   example: 유저 프로필 등록에 실패했습니다.
 */

/**
 * @swagger
 * /api/users:
 *   put:
 *     summary: 유저 프로필 수정
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 유저 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *                   example: 유저 프로필 수정에 실패했습니다.
 */

/**
 * @swagger
 * /api/users/popular:
 *   get:
 *     summary: 인기 유저 프로필 조회
 *     tags: [User]
 *     responses:
 *       200:
 *         description: 인기 유저 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userID:
 *                         type: string
 *                         example: string
 *                       name:
 *                         type: string
 *                         example: string
 *                       profileImage:
 *                         type: string
 *                         example: string
 *                       intro:
 *                         type: string
 *                         example: string
 *                       techStack:
 *                         type: array
 *                         items:
 *                             $ref: '#/components/schemas/TechStack'
 *                       totalLikes:
 *                         type: number
 *                         example: 0
 *       500:
 *         description: 인기 유저 정보 조회 실패
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
 *                   example: 인기 유저 정보를 가져오는데 실패했습니다.
 */

/**
 * @swagger
 * /api/users/upload:
 *   post:
 *     summary: 단일 이미지 업로드 (인증 필요)
 *     description: |
 *       단일 이미지 파일을 AWS S3에 업로드합니다.
 *       - 지원 형식: jpeg, jpg, png, gif
 *       - 최대 파일 크기: 5MB
 *       - 인증된 사용자만 사용 가능
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
