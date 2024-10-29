const express = require("express");
const router = express.Router();

//controller
const userController = require("../controllers/userController");

//middleware
const auth = require("../middleware/auth");

router.get("user/:userid", userController.getUserInfo);

router.get("/popular", userController.getPopularUserProfile);

router.post("/", auth, userController.registerUserProfile);

router.put("/", auth, userController.modifyUserProfile);

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
 *           type: number
 *           description: 유저 직무
 *         profileImage:
 *           type: string
 *           description: 유저 프로필 이미지 URL
 */

/**
 * @swagger
 * /api/user/{userid}:
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
 *                         likeCount:
 *                           type: number
 *                           example: 0
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
 *                   example: 유효하지 않은 유저 ID입니다.
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
 */

/**
 * @swagger
 * /api/user:
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
 * /api/user:
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
