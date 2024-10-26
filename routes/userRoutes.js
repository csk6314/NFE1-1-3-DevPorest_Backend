const express = require("express");
const router = express.Router();

//schema
const User = require("../models/User");

//controller
const userController = require("../controllers/userController");

router.get("/user/:userid", userController.getUserInfo);

module.exports = router;
