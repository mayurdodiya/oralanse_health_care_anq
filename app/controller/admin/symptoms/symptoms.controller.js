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



const Symptoms = db.symptoms;



// add symptoms
exports.addSymptoms = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(Symptoms, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        description: req.body.description,
        createdBy: adminId
      }
      const data = await commonServices.create(Symptoms, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Symptoms"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Symptoms") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Symptoms") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit symptoms by id
exports.updateSymptomsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Symptoms, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This symptoms") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Symptoms, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This symptoms") });
    }

    const obj = {
      name: req.body.name,
      description: req.body.description,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Symptoms, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Symptoms"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Symptoms"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete symptoms by id
exports.deleteSymptomsById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Symptoms, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Symptoms") });
    }


    let data = await commonServices.delete(Symptoms, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Symptoms"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Symptoms"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view symptoms by id
exports.viewSymptomsById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'description'],
    };
    let data = await commonServices.get(Symptoms, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Symptoms"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This Symptoms"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all symptoms
exports.viewAllSymptoms = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ['id', 'name', 'description']
    };

    let data = await commonServices.getAndCountAll(Symptoms, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Symptoms"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This Symptoms") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
