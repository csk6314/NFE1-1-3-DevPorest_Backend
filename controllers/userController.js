const User = require("../models/User");
const mongoose = require("mongoose");

const getUserInfo = async (req, res) => {
  const { userid } = req.params;

  try {
    const userDoc = await User.findOne({ userID: userid });

    if (!userDoc) {
      return res.status(404).json({ message: "사용자정보를 찾을 수 없어요" });
    }

    /* 포트폴리오 가져오는 코드 추가해야 함 **/

    res.json(userDoc);
  } catch (err) {
    res.status(500).json({ message: "서버에러" });
  }
};

const registerUserProfile = async (req, res) => {
  const { id, access_token } = req.userinfo;

  // AccessToken을 사용하여 Github 유저 정보 가져오기
  const userData = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((res) => res.json());

  const {
    email,
    phoneNumber,
    links,
    intro,
    profileImage,
    techStack,
    jobGroup,
  } = req.body;

  try {
    const userDoc = await User.create({
      userID: id,
      name: userData.name,
      links,
      email,
      phoneNumber,
      intro,
      profileImage,
      techStack,
      jobGroup,
    });
    res.json(userDoc);
  } catch (err) {
    res.status(500).json({
      message: "유저 프로필 등록 중 오류가 발생했습니다.",
      error: err,
    });
  }
};

module.exports = {
  getUserInfo,
  registerUserProfile,
};
