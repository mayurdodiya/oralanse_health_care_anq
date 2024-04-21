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



const College = db.colleges;



// add collage
exports.addCollage = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(College, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        createdBy: adminId
      }
      const data = await commonServices.create(College, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("College"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("College") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("College") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit collage by id
exports.updateCollageById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(College, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This college") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(College, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This college") });
    }

    const obj = {
      name: req.body.name,
      updatedBy: adminId,
    }
    let data = await commonServices.update(College, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("College"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("College"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete collage by id
exports.deleteCollageById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(College, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This college") });
    }


    let data = await commonServices.delete(College, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("College"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("College"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view collage by id
exports.viewCollageById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(College, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This college") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'name'],
    };
    let data = await commonServices.get(College, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("College"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This college"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all collage
exports.viewAllCollage = async (req, res) => {

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

    let data = await commonServices.getAndCountAll(College, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("College"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This college") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
