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
        url: `http://localhost:/${port}`,
        description: "Local Development",
      },
    ],
    // components: {},
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
