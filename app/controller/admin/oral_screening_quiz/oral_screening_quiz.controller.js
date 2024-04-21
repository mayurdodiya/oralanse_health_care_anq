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



const OralScreeningQuiz = db.oral_screening_quiz;



// add oral screening question
exports.addOralScreeningQuiz = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { question: req.body.question } };
    const isExistingData = await commonServices.get(OralScreeningQuiz, query);

    if (isExistingData == null) {

      let obj = {
        question: req.body.question,
        option_type: req.body.option_type,
        options: req.body.options,
        createdBy: adminId
      }
      const data = await commonServices.create(OralScreeningQuiz, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Oral screening question"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Oral screening question") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Oral screening question") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit oral screening question by id
exports.updateOralScreeningQuizById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(OralScreeningQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This oral screening question") });
    }

    const query = { where: [{ question: req.body.question }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(OralScreeningQuiz, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This oral screening question") });
    }

    const obj = {
      question: req.body.question,
      option_type: req.body.option_type,
      options: req.body.options,
      updatedBy: adminId,
    }
    let data = await commonServices.update(OralScreeningQuiz, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Oral screening question"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Oral screening question"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete oral screening question by id
exports.deleteOralScreeningQuizById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(OralScreeningQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This oral screening question") });
    }


    let data = await commonServices.delete(OralScreeningQuiz, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Oral screening question"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Oral screening question"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view oral screening question by id
exports.viewOralScreeningQuizById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(OralScreeningQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This oral screening question") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'question', 'option_type', 'options'],
    };

    const data = await commonServices.get(OralScreeningQuiz, query)
    const jsondata = JSON.parse(data.options)
    const response = commonResponse.logResponse(data, jsondata)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Oral screening question"),
        data: response
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This oral screening question"),
      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all oral screening question
exports.viewAllOralScreeningQuiz = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { question: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'question', 'option_type', 'options'],
    };

    let data = await commonServices.getAndCountAll(OralScreeningQuiz, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      responseData.data.map(item => {
        item.options = JSON.parse(item.options)
      });

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Oral screening question"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Oral screening question") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
