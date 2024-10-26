const User = require("../models/User");
const mongoose = require("mongoose");

const getUserInfo = async (req, res) => {
  const { userid } = req.params;

  try {
    const userDoc = await User.findOne({ userID: userid });

    if (!userDoc) {
      return res.status(404).json({ message: "사용자정보를 찾을 수 없어요" });
    }

    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "서버에러" });
  }
};

module.exports = {
  getUserInfo,
};
