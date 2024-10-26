const express = require("express");
const router = express.Router();

const techStackController = require("../controllers/techStackController");

router.get("/", techStackController.getAllTechStacks);

router.post("/", techStackController.createTechStack);

module.exports = router;
