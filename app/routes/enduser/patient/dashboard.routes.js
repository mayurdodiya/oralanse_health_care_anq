const dashboardController = require("../../../controller/enduser/patient/dashboard/dashboard.controller");
const dashboardServices = require("../../../controller/enduser/patient/dashboard/service");
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

  app.get("/api/topic", [authJwt.verifyUserToken], dashboardController.getAllTopics);
  app.get("/api/user/checkenrollment", [authJwt.verifyUserToken], dashboardController.getPatientFlag);
  app.get("/api/user/referralrequest", [authJwt.verifyUserToken], dashboardController.viewAllMyReferralRequest);

};
