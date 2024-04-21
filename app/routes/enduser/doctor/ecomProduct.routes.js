const ecomProductController = require("../../../controller/enduser/doctor/ecomProduct/ecomProduct.controller.js");
const ecomProductServices = require("../../../controller/enduser/doctor/ecomProduct/service.js");
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

  // app.get("/api/doctor/productcategory", [authJwt.verifyUserToken], ecomProductController.getTrandingProductCategoryList);
  app.get("/api/doctor/product/ordersummary/:promo?", [authJwt.verifyDoctorToken], ecomProductController.OrderSummary);
  app.get("/api/doctor/product/cartlist", [authJwt.verifyDoctorToken], ecomProductController.getAllCartList);
  app.get("/api/doctor/productcategory", [authJwt.verifyDoctorToken], ecomProductController.getProductCategoryListingSeraching);
  app.get("/api/doctor/product", [authJwt.verifyDoctorToken], ecomProductController.getAllProduct);
  app.get("/api/doctor/product/orderlisting", [authJwt.verifyDoctorToken], ecomProductController.orderListing);
  app.post("/api/doctor/product/addaddress", [authJwt.verifyDoctorToken], ecomProductController.addShippingAddress);
  app.get("/api/doctor/product/addresslisting", [authJwt.verifyDoctorToken], ecomProductController.shippingAddressListing);
  app.put("/api/doctor/product/address/:id", [authJwt.verifyDoctorToken], ecomProductController.editUserAddressById);
  app.get("/api/doctor/product/address/:id", [authJwt.verifyDoctorToken], ecomProductController.viewUserAddressById);
  app.delete("/api/doctor/product/address/:id", [authJwt.verifyDoctorToken], ecomProductController.deleteUserEcomAddressById);
  app.post("/api/doctor/product/createorder", [authJwt.verifyDoctorToken], ecomProductController.createOrder);
  app.post("/api/doctor/product/verifyorder", [authJwt.verifyDoctorToken], ecomProductController.verifyOrder);
  app.get("/api/doctor/product/:slug", [authJwt.verifyDoctorToken], ecomProductController.viewProductById);
  app.get("/api/doctor/product/listbycategory/:slug", [authJwt.verifyDoctorToken], ecomProductController.viewProductListByCategory);
  app.get("/api/doctor/product/orderdetails/:id", [authJwt.verifyDoctorToken], ecomProductController.viewOrderDetailsById);
  app.post("/api/doctor/product/cart", [authJwt.verifyDoctorToken], ecomProductController.addToCart);
  app.put("/api/doctor/product/cart/:id", [authJwt.verifyDoctorToken], ecomProductController.editCartQuantityById);
  app.delete("/api/doctor/product/cartproductdelete/:id", [authJwt.verifyDoctorToken], ecomProductController.deleteCartProductById);
  app.delete("/api/doctor/product/deletecartlist", [authJwt.verifyDoctorToken], ecomProductController.deleteAllCartlist);
};