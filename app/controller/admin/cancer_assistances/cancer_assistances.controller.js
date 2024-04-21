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



const CancerAssistances = db.cancer_assistances;



// add cancer assistances
exports.addCancerAssistances = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { title: req.body.title } };
    const isExistingData = await commonServices.get(CancerAssistances, query);

    if (isExistingData == null) {
      const slug = await commonServices.generateSlug(req.body.title);
      let obj = {
        title: req.body.title,
        sub_title: req.body.sub_title,
        description: req.body.description,
        slug: slug,
        image_path: req.body.image_path,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        meta_keywords: req.body.meta_keywords,
        createdBy: adminId
      }
      const data = await commonServices.create(CancerAssistances, obj)
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Cancer assistances") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Cancer assistances") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Cancer assistances") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit cancer assistances by id
exports.updateCancerAssistancesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const slug = req.params.slug
    const user = await commonServices.get(CancerAssistances, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This cancer assistances") });
    }
    const id = user.id;

    const query = { where: [{ title: req.body.title }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(CancerAssistances, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This cancer assistances") });
    }

    const obj = {
      title: req.body.title,
      sub_title: req.body.sub_title,
      description: req.body.description,
      slug: slug,
      image_path: req.body.image_path,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
      updatedBy: adminId,
    }
    let data = await commonServices.update(CancerAssistances, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Cancer assistances") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Cancer assistances") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete cancer assistances by id
exports.deleteCancerAssistancesById = async (req, res) => {
  try {

    const slug = req.params.slug
    const user = await commonServices.get(CancerAssistances, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This cancer assistances") });
    }
    const id = user.id;


    let data = await commonServices.delete(CancerAssistances, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Cancer assistances") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Cancer assistances") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view cancer assistances by id
exports.viewCancerAssistancesById = async (req, res) => {

  try {
    const slug = req.params.slug;
    const user = await commonServices.get(CancerAssistances, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This cancer assistances") });
    }
    const id = user.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'title', 'sub_title', 'description', 'slug', 'image_path', 'meta_title', 'meta_description', 'meta_keywords'],
    };
    let data = await commonServices.get(CancerAssistances, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Cancer assistances"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This cancer assistances") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all cancer assistances
exports.viewAllCancerAssistances = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { title: { [Op.like]: `%${s}%` } },
          { sub_title: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'title', 'sub_title', 'description', 'slug', 'image_path', 'meta_title', 'meta_description', 'meta_keywords'],
    };

    let data = await commonServices.getAndCountAll(CancerAssistances, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))
      res.status(200).json({ success: "true", message: message.GET_DATA("Cancer assistances"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This cancer assistances") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};
