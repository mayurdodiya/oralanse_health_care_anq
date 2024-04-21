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


const Degree = db.degrees;



// add degree
exports.addDegree = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(Degree, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        createdBy: adminId
      }
      const data = await commonServices.create(Degree, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Degree"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Degree") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Degree") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit degree by id
exports.updateDegreeById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Degree, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This degree") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Degree, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.EXIST("This degree") });
    }

    const obj = {
      name: req.body.name,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Degree, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Degree"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Degree"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete degree by id
exports.deleteDegreeById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Degree, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This degree") });
    }


    let data = await commonServices.delete(Degree, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Degree"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Degree"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view degree by id
exports.viewDegreeById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name'],
    };
    let data = await commonServices.get(Degree, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Degree"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This degree"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all degree
exports.viewAllDegree = async (req, res) => {

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
      attributes: ['id', 'name']
    };

    let data = await commonServices.getAndCountAll(Degree, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Degree"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This Degree") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
