const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const port = process.env.PORT || 8000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DevPorest Api",
      description: "DevPorest Web App RESTful API Documentation",
      contact: {
        name: "DevPorest",
        email: "contact@devporest.com",
        url: "https://google.com",
      },
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Development",
      },
      {
        url: `${process.env.SERVER_DEPLOY_URL}`,
        description: "Deploy Development",
      },
    ],
    // components: {},
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

// Swagger UI 커스텀 옵션 설정
const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true, // 페이지 새로고침해도 인증 상태 유지
    withCredentials: true, // 쿠키 전송 허용
  },
};

module.exports = {
  swaggerUi,
  specs,
  swaggerUiOptions, // 새로 추가된 옵션 export
};
