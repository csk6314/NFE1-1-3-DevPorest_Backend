const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController.js");

// GET /api/portfolios
router.get("/", portfolioController.getAllPortfolios);

// POST /api/portfolios
router.post("/", portfolioController.createPortfolio);

// PUT /api/portfolios/:id
router.put("/:id", portfolioController.updatePortfolio);

// DELETE /api/portfolios/:id
router.delete("/:id", portfolioController.deletePortfolio);

// GET /api/portfolios/:id
router.get("/:id", portfolioController.getPortfolioById);

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
 *             type: string
 *           description: 사용된 기술 스택 배열
 *         jobGroup:
 *           type: number
 *           description: 직무 카테고리
 *         thumbnailImage:
 *           type: string
 *           description: 썸네일 이미지 URL(단일)
 *         userID:
 *           type: string
 *           description: 포트폴리오 소유자 ID
 */

/**
 * @swagger
 * /api/portfolios:
 *   get:
 *     summary: 전체 포트폴리오 조회
 *     tags: [Portfolios]
 *     responses:
 *       200:
 *         description: 포트폴리오 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   description: 전체 포트폴리오 수
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Portfolio'
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
 *                   example: 포트폴리오 목록을 가져오는데 실패했습니다.
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
 *                   $ref: '#/components/schemas/Portfolio'
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
 * /api/portfolios:
 *   post:
 *     summary: 새 포트폴리오 생성
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
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
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
 *     summary: 포트폴리오 수정
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
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 포트폴리오를 찾을 수 없음
 *
 *   delete:
 *     summary: 포트폴리오 삭제
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
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 포트폴리오를 찾을 수 없음
 */
