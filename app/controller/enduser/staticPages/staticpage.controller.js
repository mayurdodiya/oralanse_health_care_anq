const db = require("../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices } = require("../../../services/common");
const { methods: contentServices } = require("../../../services/content");
const moment = require("moment");
const endUserServices = require("../services");
const emailServices = require("../../../services/email");
const uploadService = require("../../../services/uploadFile");
const commonResponse = require("./common.response");
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const config = require("../../../config/config.json");
const options = require('../../../config/options')
const Op = db.Sequelize.Op;

const User = db.users;
const UserDetails = db.user_details;
const StaticPage = db.static_pages;

//view static page by id
exports.getStaticPageDataById = async (req, res) => {
  try {
    const userId = req.user.id
    const { slug } = req.params
    const pageData = await commonServices.get(StaticPage, { where: { slug: slug }, attributes: ["id", "name", "description", "meta_title", "meta_description", "meta_keywords"] })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Page"), data: pageData })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}