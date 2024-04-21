const authController = require("../../controller/oral_doctor/auth/auth.controller.js");
const authCommonServices = require('../../controller/oral_doctor/auth/common.services.js');
const authJwt = require("../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/oraldoctor/login", authCommonServices.oralDoctorLoginValidation, authController.oralDoctorLogIn);
  app.post("/api/oraldoctor/forgotpwd", authCommonServices.emailValidation, authController.sendForgotPwdLink);
  app.post("/api/oraldoctor/forgotpwd/:token", authCommonServices.passwordValidation, authController.changeForgotPwd);
  app.get("/api/oraldoctor/logout", [authJwt.verifyOralDoctorToken], authController.oralDoctorLogout);  
  app.get("/api/oraldoctor/profile", [authJwt.verifyOralDoctorToken], authController.viewMyProfile);
  app.put("/api/oraldoctor/profile", [authJwt.verifyOralDoctorToken], authController.editProfile);
};