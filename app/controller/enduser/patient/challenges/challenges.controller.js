const db = require("../../../../models");
const { sequelize } = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const { methods: challengeService } = require("../../../../services/challenge");
const commonResponse = require("./common.response")
const serviceChallenge = require("./service")

const message = require("../../message");
const options = require('../../../../config/options');
const _ = require("lodash");
const moment = require("moment/moment");
const Op = db.Sequelize.Op;

const Challenge = db.challenges;
const UserChallenge = db.user_challenges;
const ChallengeAnswer = db.challenge_answers;
const ChallengeQuiz = db.challenge_quizzes;
const SmokingChallenge = db.smoking_challenges;
const StaticPage = db.static_pages;
const Setting = db.settings;


//get challenges list
exports.getChallengeList = async (req, res) => {
  try {
    const userId = req.user.id
    const challengeData = await commonServices.getAll(Challenge, { where: { is_active: true }, attributes: ["id", "name", "slug", "description", "image_path"] })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Challenges"), data: challengeData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get challenge by id
exports.getChallengeById = async (req, res) => {
  try {
    const userId = req.user.id
    const slug = req.params.slug
    const challengeData = await challengeService.viewChallengeById({ slug })
    if (!challengeData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Challenge") })
    }
    var responseData = JSON.parse(JSON.stringify(challengeData))
    responseData.challengeQA.map(item => {
      item.option = JSON.parse(item.option)
    })
    const userExistQuiz = await challengeService.getExistUserChallengeQuiz({ userId, challengeId: challengeData.id, challengeTime: challengeData.time })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Challenges"), data: responseData, existQuiz: userExistQuiz })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//start user challeng
exports.startUserChallenge = async (req, res) => {
  try {
    const userId = req.user.id
    const slug = req.params.slug

    const challengeData = await challengeService.viewChallengeById({ slug })
    if (!challengeData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Challenge") })
    }
    const existChallenge = await challengeService.challengeExist(userId, challengeData.id)
    if (!existChallenge) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Challenge") })
    }
    const userChallengeData = await commonServices.create(UserChallenge, {
      user_id: userId,
      challenge_id: challengeData.id,
      status: options.challengeStatus.ACTIVE,
      time: 0,
      createdBy: userId
    })
    return res.status(200).json({ success: "true", message: message.SUBMIT_SUCCESS("Challenge"), data: userChallengeData })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get user challenge
exports.getMyChallenges = async (req, res) => {
  try {
    const userId = req.user.id
    const { status } = req.query
    const responseData = await challengeService.getMyChallenges({ userId, status })
    const response = commonResponse.modifyMyChallenge(responseData)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Challenge"), data: response })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//add user challenge answer
exports.addUserChallengeAnswer = async (req, res) => {
  try {
    const userId = req.user.id
    const slug = req.params.slug
    const challengeData = await challengeService.viewChallengeById({ slug })
    if (!challengeData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Challenge") })
    }
    const existAnswer = await challengeService.challengeAnswerExist(userId, challengeData.id, req.body.question_id)
    if (!existAnswer) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Answer") })
    }
    const userAnswer = await challengeService.submitChallengeAnswer({ userId, challenge_id: challengeData.id, ...req.body })
    if (userAnswer) {
      const creditPoint = challengeData.credit_points / challengeData.time
      const userChallenge = await commonServices.get(UserChallenge, { where: { user_id: userId, challenge_id: challengeData.id } })
      const TODAY_START = new Date().setHours(0, 0, 0, 0);
      const TODAY_END = new Date().setHours(23, 59, 59, 999);
      const userCreditPoint = await commonServices.checkFlag(ChallengeAnswer, { where: { challenge_id: challengeData.id, user_id: userId, createdAt: { [Op.gte]: TODAY_START, [Op.lte]: TODAY_END }, } })
      const challengeCreditPoint = await commonServices.checkFlag(ChallengeQuiz, { where: { challenge_id: challengeData.id } })
      if (userCreditPoint == challengeCreditPoint) {
        await commonServices.update(UserChallenge, { where: { user_id: userId, challenge_id: challengeData.id } }, { time: userChallenge.time + 1, credit_points: userChallenge.credit_points + creditPoint })
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Answer"), data: userAnswer })
      } else {
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Answer"), data: userAnswer })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get quit smoking challenge
exports.getQuitSmokingChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const userSmokingData = await commonServices.get(SmokingChallenge, { where: { user_id: userId } })
    if (userSmokingData) {
      const response = await challengeService.getUserSmokingChallenge({ userId, total_years: userSmokingData.total_years, no_of_cigarettes: userSmokingData.no_of_cigarettes, createdAt: userSmokingData.createdAt })
      return res.status(200).json({ success: "true", message: message.GET_DATA("Smoking challenge"), data: { ...response, FAQs: serviceChallenge.faqJSON() } })
    } else {
      const response = {
        user_id: userId,
        has_challenge: false
      }
      return res.status(200).json({ success: "false", message: message.NO_DATA("Smoking challenge"), data: response })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//start quit smoking challenge
exports.startQuitSmokingChallenge = async (req, res) => {
  const userId = req.user.id;

  const userSmokingData = await commonServices.get(SmokingChallenge, { where: { user_id: userId } })
  if (userSmokingData) {
    return res.status(200).json({ success: "false", message: message.DATA_EXIST("Smoking challenge") })
  }
  const startTime = req.body.smoking_first_time
  const endTime = req.body.smoking_last_time
  const totalYear = serviceChallenge.calcualteYear(startTime, endTime)
  const createdate = new Date()
  const smokingData = await commonServices.create(SmokingChallenge, {
    user_id: userId,
    status: options.challengeStatus.ACTIVE,
    createdBy: userId,
    createdAt: createdate,
    total_years: totalYear,
    ...req.body
  })
  if (!smokingData) {
    return res.status(200).json({ success: "false", message: message.SUBMIT_FAILED("Smoking challenge") })
  }

  const response = await challengeService.getUserSmokingChallenge({ userId, total_years: smokingData.total_years, no_of_cigarettes: smokingData.no_of_cigarettes, createdAt: smokingData.createdAt })
  return res.status(200).json({ success: "true", message: message.GET_DATA("Smoking challenge"), data: { ...response, FAQs: serviceChallenge.faqJSON() } })
}
