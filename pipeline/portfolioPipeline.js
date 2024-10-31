// utils/portfolioPipeline.js

/**
 * 포트폴리오 조회를 위한 기본 파이프라인을 생성합니다.
 * @param {Object} matchStage - 초기 $match 스테이지
 * @param {Object} options - 페이지네이션 및 정렬 옵션
 * @returns {Array} Mongoose Aggregation Pipeline
 */
const createPortfolioPipeline = (matchStage = {}, options = {}) => {
  const { sort = "latest", skip = 0, limit = 15 } = options;

  const pipeline = [
    { $match: matchStage },
    // Like 컬렉션과 조인하여 좋아요 수 계산
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "portfolioID",
        as: "likes",
      },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
      },
    },
    // techStack 정보를 한 번에 조회하도록 변경
    {
      $lookup: {
        from: "techstacks",
        let: { techSkills: "$techStack" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$skill", "$$techSkills"] }, // $in : 한 번에 모든 techStack 정보를 조회
            },
          },
          {
            $project: {
              _id: 0,
              skill: 1,
              bgColor: 1,
              textColor: 1,
              jobCode: 1,
            },
          },
        ],
        as: "techStackInfo",
      },
    },
    // JobGroup 정보 조회 및 필드 선택
    {
      $lookup: {
        from: "jobgroups",
        let: { jobGroupId: "$jobGroup" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$jobGroupId"] } } },
          { $project: { _id: 0, job: 1 } },
        ],
        as: "jobGroupInfo",
      },
    },
    // 최종 필드 선택
    {
      $project: {
        _id: 1,
        title: 1,
        contents: 1,
        view: 1,
        images: 1,
        tags: 1,
        techStack: "$techStackInfo",
        createdAt: 1,
        thumbnailImage: 1,
        userID: 1,
        likeCount: 1,
        jobGroup: { $arrayElemAt: ["$jobGroupInfo.job", 0] }, // unwind 대신 $arrayElemAt을 사용하여 첫 번째 요소(job)만 선택
      },
    },
  ];

  // 정렬 조건 추가
  if (sort === "popular") {
    pipeline.push({ $sort: { likeCount: -1, createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  // 페이지네이션 추가
  if (skip > 0) {
    pipeline.push({ $skip: skip });
  }
  if (limit > 0) {
    pipeline.push({ $limit: limit });
  }

  return pipeline;
};

/**
 * 페이지네이션 메타데이터를 생성합니다.
 * @param {number} totalCount - 전체 문서 수
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 문서 수
 * @returns {Object} 페이지네이션 메타데이터
 */
const createPaginationMetadata = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    limit,
  };
};

module.exports = {
  createPortfolioPipeline,
  createPaginationMetadata,
};
