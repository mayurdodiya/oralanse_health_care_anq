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



const Banners = db.banners;



// add banner
exports.addBanners = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { title: req.body.title } };
    const isExist = await commonServices.get(Banners, query);

    if (isExist == null) {
      const data = await contentServices.addBanner({ adminId, ...req.body })
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Banners") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Banners") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Banners") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit banner by id
exports.updateBannersById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Banners, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This banner") });
    }

    const query = { where: [{ title: req.body.title }, { id: { [Op.ne]: [id] } }] };
    let isExist = await commonServices.get(Banners, query);
    if (isExist) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This banner title") });
    }

    const data = await contentServices.updateBanner({ adminId, id, ...req.body })
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Banners") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Banners") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete banner by id
exports.deleteBannersById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Banners, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This banner") });
    }

    let data = await commonServices.delete(Banners, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Banners") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Banners") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view banner by id
exports.viewBannersById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(Banners, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This banner") });
    }

    const data = await contentServices.viewBannerById({ id })

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Banners"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This Banners") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all banner 
exports.viewAllBanners = async (req, res) => {

  try {
    const { page, size } = req.query;
    const data = await contentServices.getAllBanner({ page, size })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Banners"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This banner") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

