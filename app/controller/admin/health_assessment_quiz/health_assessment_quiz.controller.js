const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;



const HealthAssessmentQuiz = db.health_assessment_quizzes;



// add health assessments question
exports.addHealtAssessmentQuiz = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { question: req.body.question } };
    const isExistingData = await commonServices.get(HealthAssessmentQuiz, query);

    if (isExistingData == null) {

      let obj = {
        health_assessment_id: req.body.health_assessment_id,
        question: req.body.question,
        option_type: req.body.option_type,
        options: req.body.options,
        createdBy: adminId
      }
      const data = await commonServices.create(HealthAssessmentQuiz, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Health assessments question"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Health assessments question") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Health assessments question") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit health assessments question by id
exports.updateHealtAssessmentQuizById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(HealthAssessmentQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This health assessment question") });
    }

    const query = { where: [{ question: req.body.question }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(HealthAssessmentQuiz, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This health assessment question") });
    }

    const obj = {
      health_assessment_id: req.body.health_assessment_id,
      question: req.body.question,
      option_type: req.body.option_type,
      options: req.body.options,
      updatedBy: adminId,
    }
    let data = await commonServices.update(HealthAssessmentQuiz, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Health assessment question"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Health assessment question"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete health assessments question by id
exports.deleteHealtAssessmentQuizById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(HealthAssessmentQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This health assessment question") });
    }


    let data = await commonServices.delete(HealthAssessmentQuiz, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Health assessment question"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Health assessment question"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view health assessments question by id
exports.viewHealtAssessmentQuizById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(HealthAssessmentQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This health assessment question") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'question', 'option_type', 'options'],
    };

    const data = await commonServices.get(HealthAssessmentQuiz, query)
    const jsondata = JSON.parse(data.options)
    const response = commonResponse.logResponse(data, jsondata)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Health assessment question"),
        data: response
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This health assessment question"),
      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all health assessments question
exports.viewAllHealtAssessmentQuiz = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    const data = await contentServices.viewAllHealtAssessmentQuiz({ page, size, s })

    if (data) {

      data.data.map(item => {
        item.options = JSON.parse(item.options)
      });

      res.status(200).json({ success: "true", message: message.GET_DATA("Health assessment question"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Health assessments question") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
