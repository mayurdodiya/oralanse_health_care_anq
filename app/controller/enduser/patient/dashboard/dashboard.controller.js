const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: contentServices } = require("../../../../services/content")
const { methods: commonServices } = require("../../../../services/common")

const message = require("../../message");

const User = db.users;
const Patients = db.patients;
const SmokingChallenge = db.smoking_challenges;
const HealthAssessmentReport = db.health_assessment_reports;
const EnduserReferralRequests = db.enduser_referral_requests;
const UserRewardHistories = db.user_reward_histories;

//get all topics
exports.getAllTopics = async (req, res) => {
  try {
    const userId = req.user.id
    const query = {
      attributes: ["id", "title", "subTitle", "description", "image_url", "slug"]
    }
    const topicData = await contentServices.getAllTopics(query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Featured topic"), data: topicData })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get all flag for patient to show info popup
exports.getPatientFlag = async (req, res) => {
  try {
    const userId = req.user.id
    const [quitSmoking, healthAssessment] = await Promise.all([
      await commonServices.get(SmokingChallenge, { where: { user_id: userId } }),
      await commonServices.get(HealthAssessmentReport, { where: { user_id: userId } })
    ])
    let response = {
      quitSmoking: false,
      selfHealthAssessment: false
    }
    if (quitSmoking) { response.quitSmoking = true }
    if (healthAssessment) { response.selfHealthAssessment = true }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Patient"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//view all my referrals request
exports.viewAllMyReferralRequest = async (req, res) => {
  try {
    const { page, size, s } = req.query;
    const userId = req.user.id;

    let DataObj = {}
    if (s) {
      DataObj = {
        [Op.or]: [
          { status: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj, { sender_id: userId }],
      attributes: ['id', 'sender_id', 'receiver_id', 'status', 'createdAt'],
      include: [
        { model: User, as: "userSentReferralReq", attributes: ['id', 'full_name'], },
        { model: UserRewardHistories, as: "userRewards", attributes: ['id', 'reward_point', 'status'], }, // targetKey 
      ]
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    const getAllData = await commonServices.getAndCountAll(EnduserReferralRequests, query, limit, offset);
    let response = commonServices.getPagingData(getAllData, page, limit);

    const patientsRewards = await commonServices.get(Patients, { where: { user_id: userId } })
    console.log(JSON.parse(JSON.stringify(patientsRewards)));
    const userRewards = patientsRewards.reward_balance;
    response.userRewards = userRewards

    return res.status(200).json({ success: "true", message: message.GET_DATA("Referral request"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}
