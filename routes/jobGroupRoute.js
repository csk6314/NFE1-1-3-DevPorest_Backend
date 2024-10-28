const express = require("express");
const router = express.Router();
const jobGroupController = require("../controllers/jobGroupController");

router.get("/", jobGroupController.getAllJobGroup);
router.post("/", jobGroupController.createJobGroup);

module.exports = router;
