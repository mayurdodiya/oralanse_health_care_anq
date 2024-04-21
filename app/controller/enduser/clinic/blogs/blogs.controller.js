const db = require("../../../../models");
const commonResponse = require('./common.response');
const message = require("../../message");
const { methods: commonServices, pincodeExist } = require('../../../../services/common');
const moment = require("moment");
const options = require("../../../../config/options");
const Op = db.Sequelize.Op;



const Blogs = db.blogs;




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
      attributes: ['id', 'slug', 'title', 'is_trending', 'type', 'description', 'image_url', 'meta_title', 'meta_keywords', 'meta_description', 'createdAt'],
    };

    let data = await commonServices.get(Blogs, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Blogs"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This Blogs") })
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

      res.status(200).json({ success: "true", message: message.GET_DATA("Blog"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Blog") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
