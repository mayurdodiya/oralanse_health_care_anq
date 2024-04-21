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



const EcomProductCategories = db.ecom_product_categories;



// add product categories
exports.addProductCategories = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(EcomProductCategories, query);

    if (isExistingData == null) {
      const slug = await commonServices.generateSlug(req.body.name);

      let obj = {
        category_type: req.body.category_type,
        slug: slug,
        name: req.body.name,
        image_path: req.body.image_path,
        is_active: true,
        meta_title: req.body.meta_title,
        meta_description: req.body.meta_description,
        meta_keywords: req.body.meta_keywords,
        createdBy: adminId
      }
      const data = await commonServices.create(EcomProductCategories, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Product category"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Product category") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Product category") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit product categories by id
exports.updateProductCategoriesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const slug = req.params.slug
    const user = await commonServices.get(EcomProductCategories, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This product category") });
    }

    const id = user.id;
    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(EcomProductCategories, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This product category") });
    }

    const obj = {
      category_type: req.body.category_type,
      name: req.body.name,
      image_path: req.body.image_path,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
      meta_keywords: req.body.meta_keywords,
      updatedBy: adminId,
    }
    let data = await commonServices.update(EcomProductCategories, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Product category"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Product category"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete product categories by id
exports.deleteProductCategoriesById = async (req, res) => {
  try {

    const slug = req.params.slug
    const user = await commonServices.get(EcomProductCategories, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This product category") });
    }

    const id = user.id
    let data = await commonServices.delete(EcomProductCategories, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Product category"), });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Product category"), });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view product categories by id
exports.viewProductCategoriesById = async (req, res) => {

  try {
    const slug = req.params.slug;

    let query = {
      where: { slug: slug },
      attributes: ['id', 'category_type', 'name', "is_active", 'image_path', 'meta_title', 'meta_description', 'meta_keywords'],
    };
    let data = await commonServices.get(EcomProductCategories, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Product category"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This product category"),
      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all product categories
exports.viewAllProductCategories = async (req, res) => {

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
      attributes: ['id', 'category_type', 'slug', 'name', 'image_path', 'is_active', 'meta_title', 'meta_description', 'meta_keywords'],
    };

    let data = await commonServices.getAndCountAll(EcomProductCategories, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Product categories"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Product categories") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// change product category status
exports.changeProductCategoryStatus = async (req, res) => {
  try {

    const slug = req.params.slug;
    const user = await commonServices.get(EcomProductCategories, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Product categories") });
    }
    const id = user.id;

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      const data = await contentServices.changeProductCategoryStatus(id, status);
      if (data == false) {
        return res.status(200).json({ success: "false", message: message.STATUS_FAILED("Product categories") });
      }
      return res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Product categories") });
    } else {
      const status = true
      const data = await contentServices.changeProductCategoryStatus(id, status);
      if (data == false) {
        return res.status(200).json({ success: "false", message: message.STATUS_FAILED("Product categories") });
      }
      return res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Product categories") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};
