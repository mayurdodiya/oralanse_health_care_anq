const db = require("../../../../models");
const { methods: ecommerceService } = require("../../../../services/ecommerce")
const { methods: commonServices } = require("../../../../services/common")
const message = require("../../message");
const options = require('../../../../config/options')

const EcomProductCategory = db.ecom_product_categories;
//Get all product category list
exports.getProductCategoryList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size } = req.query;
    const category = await ecommerceService.getProductCategoryList({ page, size, categoryType: options.categoryType.PATIENT })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Category"), data: category })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get trending product list
exports.getTrendingProductList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size } = req.query;
    const productData = await ecommerceService.getTrendingProducts({ page, size, categoryType: options.categoryType.PATIENT })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Product"), data: productData });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//view product list by category id
exports.viewProductListByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categorySlug = req.params.slug;
    const { page, size, s, trending, price, sort } = req.query;
    const categoryId = await commonServices.get(EcomProductCategory, { where: { slug: categorySlug } })
    if (!categoryId) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Category") })
    }
    const productData = await ecommerceService.getProductListByCategory({ categoryId: categoryId.id, page, size, search: s, trending, price, sort }, res)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Product"), data: productData });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//view product detail by id
exports.viewProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const productSlug = req.params.slug;
    const productData = await ecommerceService.viewProductById({ productSlug })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Product"), data: productData })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}