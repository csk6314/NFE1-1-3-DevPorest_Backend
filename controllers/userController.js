const Like = require("../models/Like");
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

    /* 총 좋아요 수 가져오기 **/
    const likeCount = await Like.countDocuments({ userID: userid });

    res.json({
      success: true,
      data: {
        ...userDoc.toObject(),
        likeCount,
      },
    });
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

const modifyUserProfile = async (req, res) => {
  const { id } = req.userinfo;

  try {
    //github 정보인 name과 userID 변경 방지
    if (req.body["name"] || req.body["userID"]) {
      return res.status(400).json({
        success: false,
        error: "잘못된 접근입니다.",
      });
    }

    const userDoc = await User.findOneAndUpdate(
      { userID: id },
      {
        ...req.body,
      }
    );

    // 만약 user가 없을 경우
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        error: "해당 ID의 유저를 찾을 수 없습니다.",
      });
    }

    res.status(200).json({
      success: true,
      data: userDoc,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || "유저 프로필 수정에 실패했습니다.",
    });
  }
};

module.exports = {
  getUserInfo,
  registerUserProfile,
  modifyUserProfile,
};
