const ecomProductsController = require("../../controller/admin/ecom_products/ecom_products.controller.js");
const ecomProductsCommonServices = require("../../controller/admin/ecom_products/common.services.js");
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


  app.post("/api/admin/ecomproducts", [authJwt.verifyAdminToken], ecomProductsCommonServices.addValidation, ecomProductsController.addEcomProducts);
  app.put("/api/admin/ecomproducts/:id", [authJwt.verifyAdminToken], ecomProductsController.updateEcomProductsById);
  app.delete("/api/admin/ecomproducts/:id", [authJwt.verifyAdminToken], ecomProductsController.deleteEcomProductsById);
  app.get("/api/admin/ecomproducts/:id", [authJwt.verifyAdminToken], ecomProductsController.viewEcomProductsById);
  app.get("/api/admin/ecomproducts", [authJwt.verifyAdminToken], ecomProductsController.viewAllEcomProducts);
  app.get("/api/admin/ecomproductsstatus/:id", [authJwt.verifyAdminToken], ecomProductsController.changeProductStatus);
  app.get("/api/admin/orders", [authJwt.verifyAdminToken], ecomProductsController.viewAllOrders);
  app.get("/api/admin/orderdetail/:id", [authJwt.verifyAdminToken], ecomProductsController.viewOrderDetailById);
  app.put("/api/admin/changeorderstatus/:id", [authJwt.verifyAdminToken], ecomProductsController.changeOrderStatusById);
};
