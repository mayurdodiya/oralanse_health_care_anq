const EcomProductController = require("../../../controller/enduser/patient/ecomProduct/product.controller");
const EcomAddressController = require("../../../controller/enduser/patient/ecomProduct/ecom_address.controller");
const EcomProductServices = require("../../../controller/enduser/patient/ecomProduct/service");
const EcomOrderController = require("../../../controller/enduser/patient/ecomProduct/order.controller");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/productcategory", [authJwt.verifyUserToken], EcomProductController.getProductCategoryList);
  app.get("/api/user/trendingproduct", [authJwt.verifyUserToken], EcomProductController.getTrendingProductList);
  app.get("/api/user/productlist/:slug", [authJwt.verifyUserToken], EcomProductController.viewProductListByCategory);
  app.get("/api/user/product/:slug", [authJwt.verifyUserToken], EcomProductController.viewProductById);
  app.get("/api/user/ecomaddresses", [authJwt.verifyUserToken], EcomAddressController.getUserAddressList);
  app.post("/api/user/ecomaddresses", [authJwt.verifyUserToken], EcomProductServices.addAddressValidation, EcomAddressController.addUserAddress);
  app.get("/api/user/ecomaddress/:id", [authJwt.verifyUserToken], EcomAddressController.viewUserAddressById);
  app.put("/api/user/ecomaddress/:id", [authJwt.verifyUserToken], EcomAddressController.editUserAddressById);
  app.delete("/api/user/ecomaddress/:id", [authJwt.verifyUserToken], EcomAddressController.deleteUserEcomAddressById);
  app.post("/api/user/ecomorder", [authJwt.verifyUserToken], EcomProductServices.createOrderValidation, EcomOrderController.createOrder);
  app.post("/api/user/verifyecomorder", [authJwt.verifyUserToken], EcomOrderController.verifyOrder);
  app.get("/api/user/myorders", [authJwt.verifyUserToken], EcomOrderController.getAllOrderList);
  app.get("/api/user/ecomorder/:no", [authJwt.verifyUserToken], EcomOrderController.viewOrderById);
  app.get("/api/user/ecomorderproduct/:id", [authJwt.verifyUserToken], EcomOrderController.viewSingleOrderProductById);
  app.post("/api/user/cart", [authJwt.verifyUserToken], EcomOrderController.addToCart);
  app.put("/api/user/cart/:id", [authJwt.verifyUserToken], EcomOrderController.editCartQuantityById);
  app.get("/api/user/cartlist", [authJwt.verifyUserToken], EcomOrderController.getAllCartList);
  app.delete("/api/user/cartproductdelete/:id", [authJwt.verifyUserToken], EcomOrderController.deleteCartProductById);
  app.get("/api/user/ordersummary/:promo?", [authJwt.verifyUserToken], EcomOrderController.OrderSummary);
  app.delete("/api/user/deletecartlist", [authJwt.verifyUserToken], EcomOrderController.deleteAllCartlist);
};
