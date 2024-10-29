const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const commentController = require("../controllers/commentController");

router.get("/:portfolioId", commentController.getCommentsByPortfolioId); // 특정 포트폴리오의 댓글 조회

router.post("/:portfolioId", auth, commentController.createComment); // 특정 포트폴리오에 댓글 생성

router.put("/:commentId", auth, commentController.updateComment); // 특정 댓글 수정

router.delete("/:commentId", auth, commentController.deleteComment); // 특정 댓글 삭제

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: 댓글 관리 API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CommentResponse:
 *       type: object
 *       properties:
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         currentPage:
 *           type: integer
 *           description: 현재 페이지 번호
 *         totalPages:
 *           type: integer
 *           description: 전체 페이지 수
 *         totalComments:
 *           type: integer
 *           description: 전체 댓글 수
 *         hasNextPage:
 *           type: boolean
 *           description: 다음 페이지 존재 여부
 *         hasPrevPage:
 *           type: boolean
 *           description: 이전 페이지 존재 여부
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         userID:
 *           type: string
 *         portfolioID:
 *           type: string
 *     NewComment:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /api/comments/{portfolioId}:
 *   get:
 *     summary: 포트폴리오의 댓글 조회 (페이지네이션)
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *         description: 포트폴리오 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: 페이지당 댓글 수
 *     responses:
 *       200:
 *         description: 성공적인 응답
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: 잘못된 요청 (페이지 번호나 limit가 유효하지 않음)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * /api/comments/{portfolioId}:
 *   post:
 *     summary: 포트폴리오의 댓글 생성
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewComment'
 *     responses:
 *       201:
 *         description: 성공적인 응답
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         userID:
 *           type: string
 *         portfolioID:
 *           type: string
 *     NewComment:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */
/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     summary: 댓글 수정
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 수정할 댓글의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 수정할 댓글 내용
 *     responses:
 *       200:
 *         description: 댓글이 성공적으로 수정됨
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: 댓글 수정 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 댓글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 댓글의 ID
 *     responses:
 *       204:
 *         description: 댓글이 성공적으로 삭제됨
 *       403:
 *         description: 댓글 삭제 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 댓글을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
