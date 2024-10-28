const express = require("express");
const router = express.Router();
const jobGroupController = require("../controllers/jobGroupController");

router.get("/", jobGroupController.getAllJobGroup);
router.post("/", jobGroupController.createJobGroup);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: JobGroup
 *   description: 직무 정보 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobGroup:
 *       type: object
 *       required:
 *         - _id
 *         - job
 *       properties:
 *         _id:
 *           type: string
 *           description: 직무 코드 (id)
 *         job:
 *           type: string
 *           description: 직무 이름
 */
/**
 * @swagger
 * /api/job-group:
 *   get:
 *     summary: 전체 직무 조회
 *     tags: [JobGroup]
 *     responses:
 *       200:
 *         description: 전체 직무 목록 조회 성공
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
 *                     $ref: '#/components/schemas/JobGroup'
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
 *                   example: 직무 정보를 가져오는데 실패했습니다.
 */
/**
 * @swagger
 * /api/job-group:
 *   post:
 *     summary: 새로운 직무 생성
 *     tags: [JobGroup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job:
 *                 type: string
 *                 example: Frontend
 *     responses:
 *       201:
 *         description: 새로운 직무 생성 성공
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
 *                   - $ref: '#/components/schemas/JobGroup'
 *                   - type: object
 *                     properties:
 *                       __v:
 *                         type: number
 *                         example: 0
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
 *                   example: jobGroup 생성에 실패했습니다.
 */
