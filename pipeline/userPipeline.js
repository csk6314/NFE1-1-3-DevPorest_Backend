const userProfilePipeline = [
  // 1단계: 기본 totalLikes 0 할당
  {
    $addFields: {
      totalLikes: 0,
    },
  },
  // 2단계: 포트폴리오 조회
  {
    $lookup: {
      from: "portfolios",
      localField: "userID",
      foreignField: "userID",
      as: "portfolios",
    },
  },
  // 3단계: 포트폴리오별 좋아요 조회
  {
    $lookup: {
      from: "likes",
      localField: "portfolios._id",
      foreignField: "portfolioID",
      as: "allLikes",
    },
  },
  // 4단계: 실제 좋아요 수 계산하여 덮어쓰기
  {
    $addFields: {
      totalLikes: { $size: "$allLikes" },
    },
  },
  // 5단계: 기술스택 조인 (preserveNullAndEmptyArrays:true로 모든 유저 유지)
  {
    $lookup: {
      from: "techstacks",
      let: { skills: "$techStack" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$skill", "$$skills"],
            },
          },
        },
        {
          $project: {
            __v: 0,
            _id: 0,
          },
        },
      ],
      as: "techStack",
    },
  },
  // 6단계: 직무 정보 조인 (preserveNullAndEmptyArrays:true로 모든 유저 유지)
  {
    $lookup: {
      from: "jobgroups",
      let: { jobGroupId: "$jobGroup" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$_id", "$$jobGroupId"],
            },
          },
        },
        {
          $project: {
            __v: 0,
            _id: 0,
          },
        },
      ],
      as: "jobGroup",
    },
  },
  {
    $unwind: {
      path: "$jobGroup",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $addFields: {
      // jobGroup 필드를 객체 형태에서 String으로 변환
      jobGroup: "$jobGroup.job",
    },
  },
  // 마지막 단계: 불필요한 필드 제거
  {
    $project: {
      portfolios: 0,
      allLikes: 0,
      __v: 0,
      _id: 0,
    },
  },
];

module.exports = {
  userProfilePipeline,
};
