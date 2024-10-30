const express = require("express");
const router = express.Router();

const techStackController = require("../controllers/techStackController");

router.get("/", techStackController.getAllTechStacks);
router.get("/statistic", techStackController.getTechStackStatistic);

router.post("/", techStackController.createTechStack);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: TechStack
 *   description: 기술스택 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TechStack:
 *       type: object
 *       required:
 *         - skill
 *         - jobCode
 *       properties:
 *         skill:
 *           type: string
 *           description: 기술스택 이름
 *         bgColor:
 *           type: string
 *           description: 기술스택 태그 배경 색상
 *         textColor:
 *           type: string
 *           description: 기술스택 태그 글자 색상
 *         jobCode:
 *           type: string
 *           description: 직군 코드
 */
/**
 * @swagger
 * /api/techstacks:
 *   get:
 *     summary: 전체 기술스택 조회
 *     tags: [TechStack]
 *     responses:
 *       200:
 *         description: 기술스택 목록 조회 성공
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
 *                     $ref: '#/components/schemas/TechStack'
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
 *                   example: 기술스택 목록을 가져오는데 실패했습니다.
 */
/**
 * @swagger
 * /api/techstacks:
 *   post:
 *     summary: 새로운 기술스택 생성
 *     tags: [TechStack]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TechStack'
 *     responses:
 *       201:
 *         description: 기술스택 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TechStack'
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
 *                   example: 기술스택 생성에 실패했습니다.
 */
/**
 * @swagger
 * /api/techstacks/statistic:
 *   get:
 *     summary: 전체 기술스택 조회
 *     tags: [TechStack]
 *     parameters:
 *       - in: query
 *         name: jobcode
 *         required: false
 *         schema:
 *           type: string
 *         description: 직무 코드(ID) (24자리 16진수 ObjectId)
 *     responses:
 *       200:
 *         description: 기술스택 목록 조회 성공
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
 *                     allOf:
 *                     - $ref: '#/components/schemas/TechStack'
 *                     - type: object
 *                     - properties:
 *                         _id:
 *                           type: string
 *                           example: 0
 *                         total_count:
 *                           type: number
 *                           example: 0
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
 *                   example: 기술스택 통계를 가져오는데 실패했습니다.
 */
