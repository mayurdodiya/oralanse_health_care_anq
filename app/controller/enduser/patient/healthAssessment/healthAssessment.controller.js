const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices } = require("../../../../services/common");

const message = require("../../message");
const assessmentService = require("./service");

const SelfHealthAssessment = db.health_assessments;
const SelfHealthAssessmentReport = db.health_assessment_reports;
const HealthAssessmentQuiz = db.health_assessment_quizzes;
const HealthAssessmentAnswer = db.health_assessment_answers;
const Treatment = db.treatments;
const User = db.users;
const UserDetails = db.user_details;

//get self health assessment list
exports.getHealtAssessmentList = async (req, res) => {
  try {
    const userId = req.user.id
    const healthAssessment = await commonServices.getAll(SelfHealthAssessment, { attributes: ["id", "name", "image_path"] })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Health Assessment"), data: healthAssessment })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get self health assessment quiz list
exports.getHealthAssessmentQuiz = async (req, res) => {
  try {
    const userId = req.user.id
    const assessmentId = req.params.id
    const assessmentQuiz = await commonServices.getAll(HealthAssessmentQuiz, { where: { health_assessment_id: assessmentId }, attributes: ["id", "question", "option_type", "options"] })
    assessmentQuiz.map(item => {
      item.options = JSON.parse(item.options)
    })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Question"), data: assessmentQuiz })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//add health assessment quiz answer
exports.submitHealthAssessmentQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const assessmentId = req.params.id
    let answerArr = req.body.answer;
    const t = await db.sequelize.transaction()
    try {
      const healthAssessmentReport = await commonServices.create(SelfHealthAssessmentReport,
        { user_id: userId, health_assessment_id: assessmentId, createdBy: userId, updatedBy: userId }, { transaction: t })
      answerArr = answerArr.map(i => {
        return {
          user_id: userId,
          health_assessment_report_id: healthAssessmentReport.id,
          question_id: i.question_id,
          answers: i.answers,
          createdBy: userId
        }
      })
      const healthAssessmentAnswer = await commonServices.bulkCreate(HealthAssessmentAnswer, answerArr, { transaction: t })
      await t.commit()
      if (healthAssessmentAnswer.length == 0) {
        return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Answer") })
      } else {
        const assessmentAnswer = await commonServices.getAll(HealthAssessmentAnswer, {
          where: { health_assessment_report_id: healthAssessmentReport.id, user_id: userId },
          include: [{ model: HealthAssessmentQuiz, as: "healthAssessment", where: { health_assessment_id: assessmentId } }]
        })

        let assessmentRes = JSON.parse(JSON.stringify(assessmentAnswer))
        assessmentRes.map(item => {
          item.answers = JSON.parse(item.answers)
          item.healthAssessment.options = JSON.parse(item.healthAssessment.options)
          item.healthAssessment.score = JSON.parse(item.healthAssessment.score)
        })
        const assessmentType = await commonServices.get(SelfHealthAssessment, { where: { id: assessmentId } })
        const sum = assessmentService.calculateAssesmentScore(assessmentRes);
        const interpretationData = assessmentService.getIntepretationMapArray(assessmentType.name)
        const interpretation = assessmentService.getScoreInterpretation(sum, interpretationData);
        let response = {
          score: sum,
          interpretation: interpretation
        }
        const reportScore = await commonServices.update(SelfHealthAssessmentReport, {
          where: { id: healthAssessmentReport.id }
        }, { tips: response.interpretation, score: response.score })
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Answer"), data: healthAssessmentAnswer })
      }
    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get health assessment report list
exports.getHealthAssessmentReportList = async (req, res) => {
  try {
    const userId = req.user.id
    const assessmentReportId = req.params.id
    const { page, size } = req.query;
    const { limit, offset } = commonServices.getPagination(page, size);
    const assessmentReport = await commonServices.getAndCountAll(SelfHealthAssessmentReport, {
      where: { user_id: userId, health_assessment_id: assessmentReportId },
      attributes: ["id", "user_id", "tips", "score", "createdAt"],
      include: [{ model: User, as: "health_assessment_reports_user", attributes: ["full_name", "profile_image"], include: [{ model: UserDetails, as: "user_details", attributes: ["age", "gender"] }] }]
    }, limit, offset)
    const response = commonServices.getPagingData(assessmentReport, page, limit)
    let responseData = JSON.parse(JSON.stringify(response))
    return res.status(200).json({ success: "true", message: message.GET_DATA("The health assessment report"), data: responseData })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get health assessment report
exports.getSelfAssesmentReport = async (req, res) => {
  try {
    const userId = req.user.id
    const assessmentReportId = req.params.id
    const assessmentReport = await commonServices.get(SelfHealthAssessmentReport, {
      where: { user_id: userId, id: assessmentReportId },
      attributes: ["id", "user_id", "tips", "score", "treatments", "createdAt"]
    })
    const assessmentRes = JSON.parse(JSON.stringify(assessmentReport))
    if (!assessmentRes) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Assessment report") })
    }
    if (assessmentRes.treatments !== null) {
      const treatment = await commonServices.getAll(Treatment, { where: { id: JSON.parse(assessmentRes.treatments) }, attributes: ["id", "name", "image_path"] })
      var treatmentRes = JSON.parse(JSON.stringify(treatment))
    } else {
      var treatmentRes = null
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("The health assessment report"), data: { ...assessmentRes, suggest_treatment: treatmentRes } })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}