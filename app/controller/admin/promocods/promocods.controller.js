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



const Promocods = db.promocods;



// add promocods
exports.addPromocods = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { coupon_code: req.body.coupon_code } };
    const isExistingData = await commonServices.get(Promocods, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        description: req.body.description,
        percentage: req.body.percentage,
        coupon_code: req.body.coupon_code,
        is_active: true,
        createdBy: adminId
      }
      const data = await commonServices.create(Promocods, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Promocods"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Promocods") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Promocods") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit promocods by id
exports.updatePromocodsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Promocods, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Promocods") });
    }

    const query = { where: [{ coupon_code: req.body.coupon_code }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Promocods, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This coupon code") });
    }

    const obj = {
      name: req.body.name,
      description: req.body.description,
      percentage: req.body.percentage,
      coupon_code: req.body.coupon_code,
      is_active: true,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Promocods, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Promocods"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Promocods"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete promocods by id
exports.deletePromocodsById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Promocods, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Promocods") });
    }


    let data = await commonServices.delete(Promocods, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Promocods"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Promocods"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view promocods by id
exports.viewPromocodsById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'description', 'percentage', 'coupon_code', 'is_active'],
    };
    let data = await commonServices.get(Promocods, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Promocods"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "false",
        message: message.NO_DATA("This Promocods"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all promocods
exports.viewAllPromocods = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { name: { [Op.like]: `%${s}%` } },
          { coupon_code: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'name', 'description', 'percentage', 'coupon_code', 'is_active'],
    };

    let data = await commonServices.getAndCountAll(Promocods, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Promocods"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This Promocods") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// active user status
exports.updatePromocodsStatus = async (req, res) => {
  try {

    const id = req.params.id;
    const user = await commonServices.get(Promocods, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Promocods") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changePromocodsStatus(id, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Promocods") });
    } else {
      const status = true
      await contentServices.changePromocodsStatus(id, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Promocods") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};
