const userProfilePipeline = [
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
      // 포스트의 좋아요 수 필드 추가
      totalLikes: { $size: "$post_likes" },
    },
  },
  {
    $project: {
      // 불필요한 필드 제거
      user_portfolios: 0,
      post_likes: 0,
      __v: 0,
      _id: 0,
    },
  },
  {
    $lookup: {
      // 기술스택 join
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
      // 직무 정보 join
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
      // jobGroup 필드를 객체 형태에서 String으로 변환
      jobGroup: "$jobGroup.job",
    },
  },
];

module.exports = {
  userProfilePipeline,
};
