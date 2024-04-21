const productCategoriesController = require("../../controller/admin/ecom_product_categories/ecom_product_categories.controller.js");
const productCategoriesCommonServices = require("../../controller/admin/ecom_product_categories/common.services.js");
const authJwt = require("../../middleware/authjwt.js");
const multer = require('multer');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/admin/productcategories", [authJwt.verifyAdminToken], productCategoriesCommonServices.addValidation, productCategoriesController.addProductCategories);
  app.put("/api/admin/productcategories/:slug", [authJwt.verifyAdminToken], productCategoriesController.updateProductCategoriesById);
  app.delete("/api/admin/productcategories/:slug", [authJwt.verifyAdminToken], productCategoriesController.deleteProductCategoriesById);
  app.get("/api/admin/productcategories/:slug", [authJwt.verifyAdminToken], productCategoriesController.viewProductCategoriesById);
  app.get("/api/admin/productcategories", [authJwt.verifyAdminToken], productCategoriesController.viewAllProductCategories);
  app.put("/api/admin/productcategories/status/:slug", [authJwt.verifyAdminToken], productCategoriesController.changeProductCategoryStatus);
};
