const express = require("express");
const TechStack = require("../models/TechStack");
const techStackController = require("../controllers/techStackController");
const router = express.Router();

router.post("/", techStackController.createTechStack);

module.exports = router;
