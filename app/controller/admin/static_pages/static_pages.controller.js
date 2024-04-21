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
const moment = require("moment")
const options = require("../../../config/options");



const StaticPages = db.static_pages;



// add static page
exports.addStaticPage = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(StaticPages, query);

    if (isExistingData == null) {
      const slug = await commonServices.generateSlug(req.body.name);
      let obj = {
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        slug: slug,
        image_path: req.body.image_path,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        meta_keywords: req.body.meta_keywords,
        createdBy: adminId
      }
      const data = await commonServices.create(StaticPages, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Static page"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Static page") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Static page") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit static page by id
exports.updateStaticPageById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const slug = req.params.slug
    const user = await commonServices.get(StaticPages, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This static page") });
    }
    const id = user.id;

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(StaticPages, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This static page") });
    }

    const obj = {
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      image_path: req.body.image_path,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
      updatedBy: adminId,
    }
    let data = await commonServices.update(StaticPages, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Static page"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Static page"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete static page by id
exports.deleteStaticPageById = async (req, res) => {
  try {

    const slug = req.params.slug
    const user = await commonServices.get(StaticPages, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This static page") });
    }
    const id = user.id;


    let data = await commonServices.delete(StaticPages, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Static page"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Static page"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view static page by id
exports.viewStaticPageById = async (req, res) => {

  try {
    const slug = req.params.slug;
    const user = await commonServices.get(StaticPages, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This static page") });
    }
    const id = user.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'slug', 'type', 'description', 'image_path', 'meta_title', 'meta_description', 'meta_keywords'],
    };
    let data = await commonServices.get(StaticPages, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Static page"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This static page") })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all static page
exports.viewAllStaticPage = async (req, res) => {

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
      attributes: ['id', 'name', 'slug', 'type', 'description', 'image_path', 'createdAt']
    };

    let data = await commonServices.getAndCountAll(StaticPages, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))
      res.status(200).json({ success: "true", message: message.GET_DATA("Static page"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This static page") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
