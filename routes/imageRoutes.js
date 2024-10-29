const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const uploadController = require("../controllers/uploadController");

// 단일 이미지 업로드 라우트
router.post(
  "/upload",
  auth,
  upload.single("image"),
  uploadController.uploadSingleImage
);

// 다중 이미지 업로드 라우트 (최대 5개, 각 5MB 제한)
router.post(
  "/uploads",
  auth,
  upload.array("images", 5),
  uploadController.uploadMultipleImages
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: 이미지 업로드 관리 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ImageUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 업로드 성공 여부
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: 업로드된 이미지의 S3 URL
 *     MultipleImageUploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 업로드 성공 여부
 *         data:
 *           type: object
 *           properties:
 *             urls:
 *               type: array
 *               items:
 *                 type: string
 *               description: 업로드된 이미지들의 S3 URL 배열
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: 에러 메시지
 */

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: 단일 이미지 업로드 (인증 필요)
 *     description: |
 *       단일 이미지 파일을 AWS S3에 업로드합니다.
 *       - 지원 형식: jpeg, jpg, png, gif
 *       - 최대 파일 크기: 5MB
 *       - 인증된 사용자만 사용 가능
 *     tags: [Images]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 업로드할 이미지 파일
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUploadResponse'
 *             example:
 *               success: true
 *               data:
 *                 url: "https://bucket-name.s3.region.amazonaws.com/user-id/timestamp-filename.jpg"
 *       400:
 *         description: 잘못된 요청 (이미지 없음 또는 잘못된 형식)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "이미지 파일이 없습니다."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증이 필요합니다"
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "이미지 업로드에 실패했습니다."
 */
/**
 * @swagger
 * /api/images/uploads:
 *   post:
 *     summary: 다중 이미지 업로드 (인증 필요)
 *     description: |
 *       최대 5개의 이미지 파일을 AWS S3에 업로드합니다.
 *       - 지원 형식: jpeg, jpg, png, gif
 *       - 파일당 최대 크기: 5MB
 *       - 최대 업로드 개수: 5개
 *       - 인증된 사용자만 사용 가능
 *     tags: [Images]
 *     security:
 *       - cookieAuth: []
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
 *                   type: string
 *                   format: binary
 *                 description: 업로드할 이미지 파일들
 *     responses:
 *       200:
 *         description: 이미지 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleImageUploadResponse'
 *             example:
 *               success: true
 *               data:
 *                 urls: [
 *                   "https://bucket-name.s3.region.amazonaws.com/user-id/timestamp-filename1.jpg",
 *                   "https://bucket-name.s3.region.amazonaws.com/user-id/timestamp-filename2.jpg"
 *                 ]
 *       400:
 *         description: 잘못된 요청 (이미지 없음, 잘못된 형식 또는 개수 초과)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "이미지 파일이 없습니다."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증이 필요합니다"
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "이미지 업로드에 실패했습니다."
 */
