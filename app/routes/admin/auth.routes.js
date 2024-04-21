const authController = require("../../controller/admin/auth/auth.controller");
const authCommonServices = require('../../controller/admin/auth/common.services');
const authJwt = require("../../middleware/authjwt");
const multer = require("multer")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/admin/login", authCommonServices.adminLoginValidation, authController.adminLogIn);
  app.post("/api/admin/forgotpwd", authCommonServices.emailValidation, authController.sendForgotPwdLink);
  app.post("/api/admin/changepwd", [authJwt.verifyAdminToken],authCommonServices.changePasswordValidation, authController.changePwd);
  app.get("/api/admin/logout", [authJwt.verifyAdminToken], authController.adminLogout);
  app.get("/api/admin/profile", [authJwt.verifyAdminToken], authController.viewMyProfile);
  app.put("/api/admin/profile", [authJwt.verifyAdminToken], authController.editProfile);
  app.post("/api/admin/forgotpwd/:token", authCommonServices.forgotePasswordValidation, authController.changeForgotPwd);

  // app.post("/api/admin/pushnotofication", authController.sendNotification);
};