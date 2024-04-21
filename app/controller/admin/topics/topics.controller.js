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



const Topics = db.topics;



// add featured topic
exports.addTopics = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { title: req.body.title } };
    const isExistingData = await commonServices.get(Topics, query);

    if (isExistingData == null) {
      const slug = await commonServices.generateSlug(req.body.title)
      let obj = {
        title: req.body.title,
        subTitle: req.body.subTitle,
        description: req.body.description,
        image_url: req.body.image_url,
        slug: slug,
        createdBy: adminId
      }
      const data = await commonServices.create(Topics, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Featured topic"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Featured topic") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Featured topic") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit featured topic by id
exports.updateTopicsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const slug = req.params.slug
    const user = await commonServices.get(Topics, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This featured topic") });
    }
    const id = user.id;
    const query = { where: [{ title: req.body.title }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Topics, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This featured topic") });
    }

    const obj = {
      title: req.body.title,
      subTitle: req.body.subTitle,
      description: req.body.description,
      image_url: req.body.image_url,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Topics, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Featured topic"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Featured topic"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete featured topic by id
exports.deleteTopicsById = async (req, res) => {
  try {

    const slug = req.params.slug
    const user = await commonServices.get(Topics, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This featured topic") });
    }

    const id = user.id;
    let data = await commonServices.delete(Topics, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Featured topic"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Featured topic"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view featured topic by id
exports.viewTopicsById = async (req, res) => {

  try {
    const slug = req.params.slug;

    let query = {
      where: { slug: slug },
      attributes: ['id', 'title', 'subTitle', 'description', 'image_url'],
    };
    let data = await commonServices.get(Topics, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Featured topic"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This featured topic"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all featured topic
exports.viewAllTopics = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { title: { [Op.like]: `%${s}%` } },
          { subTitle: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'title', 'subTitle', 'description', 'image_url'],
    };

    let data = await commonServices.getAndCountAll(Topics, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Featured topic"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This featured topic") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
