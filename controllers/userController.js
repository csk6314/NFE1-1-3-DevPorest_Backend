const User = require("../models/User");
const mongoose = require("mongoose");

const getUserInfo = async (req, res) => {
  const { userid } = req.params;

  try {
    const user = await User.aggregate([
      { $match: { userID: userid } },
      {
        $lookup: {
          // 유저의 portfolio와 join
          from: "portfolios",
          localField: "userID",
          foreignField: "userID",
          as: "user_portfolios",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          // 각 유저 포트폴리오와 like join
          from: "likes",
          localField: "user_portfolios._id",
          foreignField: "portfolioID",
          as: "post_likes",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          totalLikes: { $size: "$post_likes" },
        },
      },
      {
        $project: {
          user_portfolios: 0,
          post_likes: 0,
          __v: 0,
          _id: 0,
        },
      },
      {
        $lookup: {
          from: "techstacks",
          localField: "techStack",
          foreignField: "skill",
          as: "techStack",
          pipeline: [
            {
              $project: {
                __v: 0,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "jobgroups",
          localField: "jobGroup",
          foreignField: "_id",
          as: "jobGroup",
          pipeline: [
            {
              $project: {
                __v: 0,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: "$jobGroup",
      },
      {
        $addFields: {
          jobGroup: "$jobGroup.job",
        },
      },
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

const getPopularUserProfile = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $lookup: {
          // 유저의 portfolio와 join
          from: "portfolios",
          localField: "userID",
          foreignField: "userID",
          as: "user_portfolios",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$user_portfolios", // 배열이 아닌 포트폴리오마다 문서를 생성
      },
      {
        $lookup: {
          // 각 유저 포트폴리오와 like join
          from: "likes",
          localField: "user_portfolios._id",
          foreignField: "portfolioID",
          as: "post_likes",
          pipeline: [
            {
              $project: {
                _id: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          // 포스트의 좋아요 수 필드 추가
          like_count: { $size: "$post_likes" },
        },
      },
      {
        $group: {
          // userID로 그룹화, totalLikes = 총 좋아요 수
          _id: "$userID",
          userID: { $first: "$userID" },
          name: { $first: "$name" },
          jobGroup: { $first: "$jobGroup" },
          profileImage: { $first: "$profileImage" },
          intro: { $first: "$intro" },
          techStack: { $first: "$techStack" },
          totalLikes: { $sum: "$like_count" },
        },
      },
      {
        $lookup: {
          from: "techstacks",
          localField: "techStack",
          foreignField: "skill",
          as: "techStack",
          pipeline: [
            {
              $project: {
                __v: 0,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "jobgroups",
          localField: "jobGroup",
          foreignField: "_id",
          as: "jobGroup",
          pipeline: [
            {
              $project: {
                __v: 0,
                _id: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: "$jobGroup",
      },
      {
        $addFields: {
          jobGroup: "$jobGroup.job",
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
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

module.exports = {
  getUserInfo,
  registerUserProfile,
  modifyUserProfile,
  getPopularUserProfile,
};
