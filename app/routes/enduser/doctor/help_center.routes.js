const helpCenterController = require("../../../controller/enduser/doctor/help_center/help_center.controller.js");
const helpCenterServices = require("../../../controller/enduser/doctor/help_center/service.js");

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

  app.get("/api/doctor/faqs", [authJwt.verifyDoctorToken], helpCenterController.getAllFaqQuestionAndAnswer)
};
