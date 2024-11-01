require("dotenv").config();
const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

/**
 * @openapi
 * '/api/auth/github':
 *  get:
 *     tags:
 *     - Auth
 *     summary: Github OAuth 로그인 API
 *     responses:
 *      200:
 *        description: Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.get("/github", authController.getGithubRedirectURL);

/**
 * @openapi
 * '/api/auth/github/callback':
 *  get:
 *     tags:
 *     - Auth
 *     summary: Github OAuth Callback API
 *     parameters:
 *      - name: code
 *        in: query
 *        description: Github Authorization Code
 *        schema:
 *          type: string
 *     responses:
 *      200:
 *        description: Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.get("/github/callback", authController.getGithubCallback);

/**
 * @openapi
 * '/api/auth/logout':
 *  get:
 *     tags:
 *     - Auth
 *     summary: Logout API
 *     responses:
 *      200:
 *        description: Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.get("/logout", authController.logout);

router.get("/mock-login", authController.getMockToken); // 프론트엔드 테스트용 api

module.exports = router;
