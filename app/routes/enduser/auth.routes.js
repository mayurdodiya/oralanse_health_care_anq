const authController = require("../../controller/enduser/auth/auth.controller");
const authCommonServices = require("../../controller/enduser/auth/service");
const multer = require('multer');
const authJwt = require("../../middleware/authjwt");
const uploadFile = require("../../services/uploadFile");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/user/uploadsinglefile", [authJwt.verifyUserToken], multer().single('file'), authController.uploadSingleFile);
  app.post("/api/user/uploadmultiplefile", [authJwt.verifyUserToken], multer().array('files'), authController.uploadMultipleFile);
  app.get("/api/cityname", authController.getCityFromPincode);
  app.get("/api/user/language", authController.getAllLanguages);
  app.get("/api/user/area", authController.getAllPincodes);
  app.get("/api/user/specialities", authController.getAllSpecialists);
  app.get("/api/user/facilities", authController.getAllfacilities);
  app.get("/api/user/treatment", authController.getAlltreatments);
  app.get("/api/user/degrees", authController.getAllDegree);
  app.get("/api/user/collages", authController.getAllCollages);
  app.get("/api/bloodtypes", authController.getAllBloodTypes);
  app.get("/api/labtests", authController.getAllLabTests);
  app.get("/api/registrationcouncils", authController.getAllRegistrationCouncils);

  app.post("/api/user/sendotp", authCommonServices.checkSendOtp, authController.sendOtp);
  app.post("/api/user/verifyotp", authCommonServices.checkVerifyOtp, authController.verifyOtp);
  app.post("/api/user/registration", authCommonServices.registerValidation, authController.userRegistration);
  app.put("/api/user/profile", [authJwt.verifyUserToken], authController.editProfile);
  app.get("/api/user/profile", [authJwt.verifyUserToken], authController.viewProfile);
  app.get("/api/user/logout", [authJwt.verifyUserToken], authController.logOut);
  app.put("/api/user/language", [authJwt.verifyUserToken], authCommonServices.languageValidation, authController.changeLanguage);
  app.post("/api/user/signinwithgoogle", authCommonServices.signinGoogleValidation, authController.signinWithGoogle);
  app.post("/api/user/signinwithfacebook", authCommonServices.signinFacebookValidation, authController.signinWithFacebook);
  app.get("/api/user/switchprofile", [authJwt.verifyUserToken], authController.switchProfile);
  app.get("/api/user/activeprofile", [authJwt.verifyUserToken], authController.userActiveProfile);
  app.post("/api/user/signinwhatsapp", authController.sendCodeToWhatsApp);
};
