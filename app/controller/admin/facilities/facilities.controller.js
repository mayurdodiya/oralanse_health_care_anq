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



const Facilities = db.facilities;



// add facilities
exports.addFacilities = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(Facilities, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        description: req.body.description,
        createdBy: adminId
      }
      const data = await commonServices.create(Facilities, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Facilities"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Facilities") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Facilities") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit facilities by id
exports.updateFacilitiesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Facilities, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This facilities") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Facilities, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This facilities") });
    }

    const obj = {
      name: req.body.name,
      description: req.body.description,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Facilities, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Facilities"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Facilities"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete facilities by id
exports.deleteFacilitiesById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Facilities, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This facilities") });
    }


    let data = await commonServices.delete(Facilities, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Facilities"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Facilities"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view facilities by id
exports.viewFacilitiesById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'description'],
    };
    let data = await commonServices.get(Facilities, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Facilities"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This facilities"),
      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all facilities
exports.viewAllFacilities = async (req, res) => {

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

    let data = await commonServices.getAndCountAll(Facilities, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Facilities"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This facilities") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
