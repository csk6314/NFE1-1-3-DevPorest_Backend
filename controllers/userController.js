const User = require("../models/User");
const mongoose = require("mongoose");
const { userProfilePipeline } = require("../pipeline/userPipeline");

const getUserInfo = async (req, res) => {
  const { userid } = req.params;

  try {
    const user = await User.aggregate([
      { $match: { userID: userid } },
      ...userProfilePipeline,
    ]);

    if (user.length < 1) {
      return res
        .status(404)
        .json({ success: false, error: "해당 ID의 유저를 찾을 수 없습니다." });
    }

    res.json({
      success: true,
      data: user[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "서버에러" });
  }
};

const registerUserProfile = async (req, res) => {
  const { id, name } = req.userinfo;

  try {
    const userDoc = await User.create({
      userID: id,
      name,
      ...req.body,
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

const getPopularUserProfile = async (req, res) => {
  try {
    const user = await User.aggregate([
      ...userProfilePipeline,
      {
        $sort: { totalLikes: -1 }, // 총 좋아요 수를 기준으로 내림차순 정렬
      },
      {
        $limit: 5,
      },
    ]);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "인기 유저 정보를 가져오는데 실패했습니다.",
    });
  }
};

const getMyUserInfo = async (req, res) => {
  const { id, name, profileImage } = req.userinfo;

  try {
    const user = await User.aggregate([
      { $match: { userID: id } },
      ...userProfilePipeline,
    ]);

    if (user.length < 1) {
      return res.json({
        success: true,
        data: {
          userID: id,
          name,
          profileImage,
          newUser: true,
        },
      });
    }

    res.json({
      success: true,
      data: { ...user[0], newUser: false },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "서버에러" });
  }
};

module.exports = {
  getUserInfo,
  registerUserProfile,
  modifyUserProfile,
  getPopularUserProfile,
  getMyUserInfo,
};
