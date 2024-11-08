/**
 * upgrade된 포트폴리오 검색을 위한 파이프라인
 * @param {Object} params - 검색 매개변수
 * @param {string} params.jobGroup - 직무군 (예: 'Frontend', 'Backend')
 * @param {Array<string>} params.techStacks - 기술 스택 배열
 * @param {string} params.searchType - 검색 유형 ('user', 'title', 'tag')
 * @param {string} params.keyword - 검색 키워드
 * @param {string} params.sort - 정렬 방식 ('latest', 'views', 'likes')
 * @returns {Array} Mongoose Aggregation Pipeline
 */
const mongoose = require("mongoose");

const createSearchPipeline = (params) => {
  const {
    jobGroup = "all",
    techStacks = [],
    searchType = "title", // default : title
    keyword = "",
    sort = "latest", // default : latest
    page = 1,
    limit = 15,
  } = params;

  const pipeline = [];
  const matchConditions = {};

  // 1. 직무군 필터링
  if (jobGroup && jobGroup !== "all") {
    pipeline.push({
      $lookup: {
        from: "jobgroups",
        localField: "jobGroup",
        foreignField: "_id",
        as: "jobGroupMatch",
      },
    });

    pipeline.push({
      $match: {
        "jobGroupMatch.job": jobGroup,
      },
    });
  }

  // 2. 기술 스택 필터링 (중복 선택 가능)
  if (techStacks.length > 0) {
    pipeline.push({
      $match: {
        techStack: { $all: techStacks },
      },
    });
  }

  // 3. 키워드 검색 조건
  if (keyword && searchType) {
    switch (searchType) {
      case "user":
        pipeline.push({
          $lookup: {
            from: "users",
            let: { userId: "$userID" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$userID", "$$userId"] },
                  $or: [
                    // userID 또는 name 기반 검색
                    { userID: { $regex: keyword, $options: "i" } },
                    { name: { $regex: keyword, $options: "i" } },
                  ],
                },
              },
            ],
            as: "userMatch",
          },
        });
        pipeline.push({
          $match: {
            userMatch: { $ne: [] },
          },
        });
        break;
      case "title":
        matchConditions.title = { $regex: keyword, $options: "i" };
        break;
      case "tag":
        matchConditions.tags = { $regex: keyword, $options: "i" };
        break;
      case "likedByUser":
        pipeline.push({
          $lookup: {
            from: "likes",
            let: { portfolioId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$portfolioID", "$$portfolioId"] },
                      { $eq: ["$userID", keyword] },
                    ],
                  },
                },
              },
            ],
            as: "userLike",
          },
        });
        pipeline.push({
          $match: {
            userLike: { $ne: [] },
          },
        });
        break;
      case "_id":
        matchConditions._id = new mongoose.Types.ObjectId(keyword);
        break;
    }
  }
  // 기본 match 스테이지 추가
  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // 4. User 정보 조회
  pipeline.push({
    $lookup: {
      from: "users",
      let: { userId: "$userID" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$userID", "$$userId"] },
          },
        },
        {
          $project: {
            _id: 0,
            userID: 1,
            name: 1,
            profileImage: 1,
          },
        },
      ],
      as: "userInfo",
    },
  });

  pipeline.push({
    $addFields: {
      userInfo: { $arrayElemAt: ["$userInfo", 0] },
    },
  });

  // 5. Like 정보 조회
  pipeline.push({
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "portfolioID",
      as: "likes",
    },
  });

  pipeline.push({
    $addFields: {
      likeCount: { $size: "$likes" },
    },
  });

  // 6. TechStack 정보 조회
  pipeline.push({
    $lookup: {
      from: "techstacks",
      localField: "techStack",
      foreignField: "skill",
      as: "techStackInfo",
    },
  });

  pipeline.push({
    $addFields: {
      techStack: {
        $map: {
          input: "$techStack",
          as: "stack",
          in: {
            $let: {
              vars: {
                stackInfo: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$techStackInfo",
                        as: "info",
                        cond: { $eq: ["$$stack", "$$info.skill"] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: {
                // 필요한 필드들만 명시적으로 포함
                skill: "$$stackInfo.skill",
                bgColor: "$$stackInfo.bgColor",
                textColor: "$$stackInfo.textColor",
                jobCode: "$$stackInfo.jobCode",
              },
            },
          },
        },
      },
    },
  });

  // 7. JobGroup 정보 조회
  pipeline.push({
    $lookup: {
      from: "jobgroups",
      let: { jobGroupId: "$jobGroup" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$jobGroupId"] } } },
        { $project: { _id: 0, job: 1 } },
      ],
      as: "jobGroupInfo",
    },
  });

  // 8. 최종 필드 선택
  pipeline.push({
    $project: {
      _id: 1,
      title: 1,
      contents: 1,
      view: 1,
      images: 1,
      tags: 1,
      techStack: 1,
      createdAt: 1,
      thumbnailImage: 1,
      userInfo: 1,
      likeCount: 1,
      links: 1,
      jobGroup: { $arrayElemAt: ["$jobGroupInfo.job", 0] },
    },
  });

  // 9. 정렬 조건
  switch (sort) {
    case "views":
      pipeline.push({ $sort: { view: -1, createdAt: -1 } });
      break;
    case "likes":
      pipeline.push({ $sort: { likeCount: -1, createdAt: -1 } });
      break;
    default: // latest
      pipeline.push({ $sort: { createdAt: -1 } });
  }

  return pipeline;
};

/**
 * 페이지네이션 메타데이터 생성 함수
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

module.exports = { createSearchPipeline, createPaginationMetadata };
