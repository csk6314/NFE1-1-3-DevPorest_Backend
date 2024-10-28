const express = require("express");
const router = express.Router();
const jobGroupController = require("../controllers/jobGroupController");

router.post("/", jobGroupController.createJobGroup);

module.exports = router;
