const db = require('../../app/models');
const jwt = require('jsonwebtoken');
const moment = require("moment");
const { methods: commonServices } = require("./common");
const options = require("../config/options");
const Op = db.Sequelize.Op;
const _ = require("lodash");
const commonConfig = require("../config/common.config");
const challengeService = require('../controller/enduser/patient/challenges/service')

const Challenge = db.challenges;
const UserChallenge = db.user_challenges;
const ChallengeQuiz = db.challenge_quizzes;
const ChallengeAnswer = db.challenge_answers;
const StaticPage = db.static_pages;
const Setting = db.settings;

const methods = {
  viewChallengeById: async (data) => {
    try {
      const challengeData = await commonServices.get(Challenge,
        {
          where: { slug: data.slug, is_active: true },
          attributes: ["id", "name", "slug", "time", "credit_points", "description", "image_path"],
          include: [{ model: ChallengeQuiz, as: "challengeQA", attributes: ["id", "question_title", "question", "option_type", "option"] }]
        })
      return challengeData
    } catch (error) {
      return error
    }
  },
  challengeExist: async (userId, challenge_id) => {
    return commonServices.checkFlag(UserChallenge,
      { where: { user_id: userId, challenge_id: challenge_id, status: options.challengeStatus.ACTIVE } })
      .then((count) => {
        if (count != 0) {
          return false;
        }
        return true;
      });
  },
  getMyChallenges: async (data) => {
    try {
      const myChallenge = await commonServices.getAll(UserChallenge, {
        where: { user_id: data.userId, status: data.status }, attributes: ["id", "user_id", "challenge_id", "status", "time", "credit_points", "createdAt"],
        include: [{ model: Challenge, as: "challenge", required: true, where: { is_active: true }, attributes: ["id", "name", "description", "image_path", "slug", "time"] }]
      })
      var responseData = JSON.parse(JSON.stringify(myChallenge))
      return responseData
    } catch (error) {
      return error
    }
  },
  challengeAnswerExist: async (userId, challenge_id, question_id) => {
    try {
      const TODAY_START = new Date().setHours(0, 0, 0, 0);
      const NOW = new Date();
      return commonServices.checkFlag(ChallengeAnswer,
        {
          where: {
            challenge_id: challenge_id, challenge_quiz_id: question_id, user_id: userId,
            createdAt: { [Op.gt]: TODAY_START, [Op.lt]: NOW },
          }
        }).then((count) => {
          if (count != 0) {
            return false;
          }
          return true;
        });
    } catch (error) {
      return error
    }

  },
  submitChallengeAnswer: async (data) => {
    try {
      const challengeAnswer = await commonServices.create(ChallengeAnswer, {
        challenge_id: data.challenge_id,
        challenge_quiz_id: data.question_id,
        user_id: data.userId,
        answer: data.answer,
        createdBy: data.userId,
      })
      return challengeAnswer
    } catch (error) {
      return error
    }

  },
  getExistUserChallengeQuiz: async (data) => {
    try {
      var userAnswer = await commonServices.getAll(ChallengeAnswer, {
        where: { user_id: data.userId, challenge_id: data.challengeId },
        attributes: ["id", "challenge_id", "user_id", "answer", "createdAt"],
        order: [['createdAt', 'DESC']],
        include: [{ model: ChallengeQuiz, as: "challengeQuiz", attributes: ["id", "question_title", "question"] }],
      })
      userAnswer.map(i => {
        i.answer = JSON.parse(i.answer)
      })
      const resp = _(userAnswer).groupBy(a => moment(a.createdAt).format("YYYY-MM-DD")).map((value, key) => ({ date: key, quiz: value })).value();
      if (resp.length == data.challengeTime) {
        await commonServices.update(UserChallenge, { where: { user_id: data.userId, challenge_id: data.challengeId } }, { status: options.challengeStatus.COMPLETED })
      }
      return resp
    } catch (error) {
      return error
    }
  },
  getUserSmokingChallenge: async (data) => {
    try {
      const staticpage = await commonServices.get(StaticPage, { where: { slug: 'quit-smoking' }, attributes: ["description"] })
      const setting = await commonServices.get(Setting, { where: { s_key: 'cigarettes_price' } })

      const totalYear = data.total_years;
      const totalCigarettes = data.no_of_cigarettes;
      const totalDays = commonServices.yearsToDays(totalYear);
      const total_smoked_cigarettes = totalDays * totalCigarettes;
      const smoked_coins = total_smoked_cigarettes * setting.value;

      const savingdata = challengeService.getSavingForSmokingChallenge(totalCigarettes, setting.value)
      const response = {
        user_id: data.userId,
        createdAt: data.createdAt,
        total_year: data.total_years,
        total_smoked_cigarettes: parseInt(total_smoked_cigarettes),
        smoked_coins: smoked_coins,
        saving: savingdata,
        has_challenge: true,
        description: staticpage.description
      }
      return response;
    } catch (error) {
      return error
    }
  }


}


module.exports = { methods }