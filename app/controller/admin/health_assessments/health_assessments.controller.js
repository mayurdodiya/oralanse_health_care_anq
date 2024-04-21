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



const HealthAssessments = db.health_assessments;



// add health assessments
exports.addHealthAssessments = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(HealthAssessments, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        image_path: req.body.image_path,
        createdBy: adminId
      }
      const data = await commonServices.create(HealthAssessments, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Health assessments"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Health assessments") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Health assessments") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit health assessments by id
exports.updateHealthAssessmentsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(HealthAssessments, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This health assessments") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(HealthAssessments, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This health assessments") });
    }

    const obj = {
      name: req.body.name,
      image_path: req.body.image_path,
      updatedBy: adminId,
    }
    let data = await commonServices.update(HealthAssessments, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Health assessments"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Health assessments"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete health assessments by id
exports.deleteHealthAssessmentsById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(HealthAssessments, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This health assessments") });
    }


    let data = await commonServices.delete(HealthAssessments, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Health assessments"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Health assessments"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view health assessments by id
exports.viewHealthAssessmentsById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'image_path'],
    };
    let data = await commonServices.get(HealthAssessments, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Health assessments"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This health assessments"),
      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all health assessments
exports.viewAllHealthAssessments = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'name', 'image_path']
    };

    let data = await commonServices.getAndCountAll(HealthAssessments, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Health assessments"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This health assessments") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
