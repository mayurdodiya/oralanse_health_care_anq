const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices } = require("../../../../services/common");
const moment = require("moment");
const message = require("../../message");
const Op = db.Sequelize.Op;
const options = require("../../../../config/options")

const User = db.users;
const Blog = db.blogs;


//get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const userId = req.user.id
    const { page, size, s, isTrending, type } = req.query
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { 'type': { [Op.like]: `%${s}%` } },
          { 'title': { [Op.like]: `%${s}%` } },
          { 'description': { [Op.like]: `%${s}%` } }
        ]
      }
    }
    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: { ...searchData },
      attributes: ["id", "type", "title", "description", "image_url", "slug", "meta_title", "meta_keywords", "meta_description", "createdAt"],
      include: [{ model: User, as: "blogUser", attributes: ["id", "slug", "full_name", "profile_image"] }]
    }
    if (isTrending == 'true') {
      query.where.is_trending = true
    }
    if (type) {
      query.where.type = type
    }
    const blogData = await commonServices.getAndCountAll(Blog, query, limit, offset)
    const responseData = commonServices.getPagingData(blogData, page, limit);
    var response = JSON.parse(JSON.stringify(responseData))
    return res.status(200).json({ success: "true", message: message.GET_LIST("Blog"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//view blog by id
exports.viewBlogById = async (req, res) => {
  try {
    const userId = req.user.id;
    const slug = req.params.slug;
    let query = {
      where: { slug: slug },
      attributes: ["id", "type", "title", "description", "image_url", "slug", "meta_title", "meta_keywords", "meta_description", "createdAt"],
      include: [{ model: User, as: "blogUser", attributes: ["id", "slug", "full_name", "profile_image"] }]
    }
    const blogData = await commonServices.get(Blog, query)
    var response = JSON.parse(JSON.stringify(blogData))
    return res.status(200).json({ success: "true", message: message.GET_DATA("Blog"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}