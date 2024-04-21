const ecomProductController = require("../../../controller/enduser/clinic/ecomProduct/ecomProduct.controller.js");
const ecomProductServices = require("../../../controller/enduser/clinic/ecomProduct/service.js");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/productcategory", [authJwt.verifyHospitalToken], ecomProductController.getProductCategoryListingSeraching);
  app.get("/api/productcategory", ecomProductController.getProductCategoryListingDropdown);
  app.get("/api/clinic/product", [authJwt.verifyHospitalToken], ecomProductController.getAllProduct);
  app.get("/api/clinic/product/order", [authJwt.verifyHospitalToken], ecomProductController.orderListing);
  app.post("/api/clinic/product/address", [authJwt.verifyHospitalToken], ecomProductController.addShippingAddress);
  app.put("/api/clinic/product/address/:id", [authJwt.verifyHospitalToken], ecomProductController.editUserAddressById);
  app.get("/api/clinic/product/address/:id", [authJwt.verifyHospitalToken], ecomProductController.viewUserAddressById);
  app.delete("/api/clinic/product/address/:id", [authJwt.verifyHospitalToken], ecomProductController.deleteUserEcomAddressById);
  app.get("/api/clinic/product/address", [authJwt.verifyHospitalToken], ecomProductController.shippingAddressListing);
  app.post("/api/clinic/product/order", [authJwt.verifyHospitalToken], ecomProductController.createOrder);
  app.post("/api/clinic/product/verifyorder", [authJwt.verifyHospitalToken], ecomProductController.verifyOrder);
  app.get("/api/clinic/product/:slug", [authJwt.verifyHospitalToken], ecomProductController.viewProductById);
  app.get("/api/clinic/product/listbycategory/:slug", [authJwt.verifyHospitalToken], ecomProductController.viewProductListByCategory);
  app.get("/api/clinic/product/orderdetails/:id", [authJwt.verifyHospitalToken], ecomProductController.viewOrderDetailsById);
  app.get("/api/clinic/trendingproduct", [authJwt.verifyHospitalToken], ecomProductController.getTrendingProductList);
  app.get("/api/clinic/marketingproduct", [authJwt.verifyHospitalToken], ecomProductController.getAllMarketingProduct);
  app.post("/api/clinic/cart", [authJwt.verifyHospitalToken], ecomProductController.addToCart);
  app.put("/api/clinic/cart/:id", [authJwt.verifyHospitalToken], ecomProductController.editCartQuantityById);
  app.get("/api/clinic/cartlist", [authJwt.verifyHospitalToken], ecomProductController.getAllCartList);
  app.delete("/api/clinic/cartproductdelete/:id", [authJwt.verifyHospitalToken], ecomProductController.deleteCartProductById);
  app.get("/api/clinic/ordersummary/:promo?", [authJwt.verifyHospitalToken], ecomProductController.OrderSummary);
  app.delete("/api/clinic/deletecartlist", [authJwt.verifyHospitalToken], ecomProductController.deleteAllCartlist);

};