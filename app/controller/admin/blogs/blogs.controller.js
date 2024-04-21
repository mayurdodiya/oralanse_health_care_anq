const db = require("../../../models");
const commonResponse = require('./common.response');
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const moment = require("moment");
const Op = db.Sequelize.Op;
const sendAllNotification = require("../../../services/settings");
const emailTmplateServices = require("../../../services/email_template")
const fcmNotificationPayload = require("../../../services/fcm_notification_payload");

const Blogs = db.blogs;


// add blogs
exports.addBlogs = async (req, res) => {
  try {

    const adminId = req.user.id;
    const query = { where: { title: req.body.title } };
    const isExistingData = await commonServices.get(Blogs, query);

    if (isExistingData == null) {
      const slug = await commonServices.generateSlug(req.body.title)
      let obj = {
        title: req.body.title,
        description: req.body.description,
        is_trending: req.body.is_trending,
        type: req.body.type,
        slug: slug,
        image_url: req.body.image_url,
        meta_title: req.body.meta_title,
        meta_keywords: req.body.meta_keywords,
        meta_description: req.body.meta_description,
        createdBy: adminId
      }
      const data = await commonServices.create(Blogs, obj)

      if (data) {

        // for email -----------------------
        // const emailTmplateServices = require("../../../services/email_template")
        // const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
        // await sendAllNotification.sendAllNotification({ email: req.body.email, context })

        // for push notification -----------
        const payload = fcmNotificationPayload.blogPayLoad({ userId: 363 })
        await sendAllNotification.sendAllNotification({ payload })

        res.status(200).json({ success: "true", message: message.ADD_DATA("Blog") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Blog") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Blog") });
    }

  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message });
  }
}

// edit blogs by id
exports.updateBlogsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Blogs, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This blog") });
    }

    const query = { where: [{ title: req.body.title }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Blogs, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This blog") });
    }

    const obj = {
      title: req.body.title,
      description: req.body.description,
      is_trending: req.body.is_trending,
      type: req.body.type,
      image_url: req.body.image_url,
      meta_title: req.body.meta_title,
      meta_keywords: req.body.meta_keywords,
      meta_description: req.body.meta_description,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Blogs, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Blog"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Blog"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete blog by id
exports.deleteBlogsById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Blogs, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This blog") });
    }


    let data = await commonServices.delete(Blogs, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Blog"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Blog"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view blog by id
exports.viewBlogsById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(Blogs, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This blog") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'slug', 'title', 'description', 'image_url', 'is_trending', 'type', 'meta_title', 'meta_keywords', 'meta_description', 'createdAt'],
    };

    let data = await commonServices.get(Blogs, query)

    if (data) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Blogs"), data: data })
    } else {
      return res.status(200).json({ success: "true", message: message.NO_DATA("This Blogs"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all blog
exports.viewAllBlogs = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { title: { [Op.like]: `%${s}%` } },
          { meta_keywords: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'slug', 'title', 'is_trending', 'type', 'description', 'image_url', 'meta_title', 'meta_keywords', 'meta_description', 'createdAt'],
    };

    let data = await commonServices.getAndCountAll(Blogs, query, limit, offset)

    if (data) {

      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Blog"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Blog") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
