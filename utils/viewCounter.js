const mongoose = require("mongoose");
const Portfolio = require("../models/Portfolio");

/**
 * 포트폴리오 조회수 증가 함수 파라미터 설명
 * @param {string} portfolioId - 포트폴리오 ID
 * @param {Object} session - 사용자 세션 객체
 * @param {Object} mongoSession - MongoDB 세션 객체 (트랜잭션용)
 * @returns {Promise<Object>} 업데이트된 포트폴리오 객체
 */
const incrementViewCount = async (
  portfolioId,
  session,
  mongoSession = null
) => {
  try {
    // 세션에서 조회 기록 확인
    if (!session.viewedPortfolios) {
      session.viewedPortfolios = {};
    }

    // 현재 시간과 마지막 조회 시간을 비교 (24시간 기준)
    const lastViewTime = session.viewedPortfolios[portfolioId];
    const currentTime = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000; // 24시간을 밀리초로 표현

    // 해당 포트폴리오를 처음 보거나, 마지막 조회로부터 24시간이 지났다면
    if (!lastViewTime || currentTime - lastViewTime > ONE_DAY) {
      const updateOptions = mongoSession ? { session: mongoSession } : {};

      // 조회수 증가
      const updatedPortfolio = await Portfolio.findByIdAndUpdate(
        portfolioId,
        { $inc: { view: 1 } },
        { ...updateOptions, new: true }
      );

      if (!updatedPortfolio) {
        throw new Error("포트폴리오를 찾을 수 없습니다.");
      }

      // 세션에 현재 시간 기록
      session.viewedPortfolios[portfolioId] = currentTime;

      return updatedPortfolio;
    }

    // 중복 조회인 경우 포트폴리오 정보만 반환
    return await Portfolio.findById(
      portfolioId,
      null,
      mongoSession ? { session: mongoSession } : {}
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { incrementViewCount };
