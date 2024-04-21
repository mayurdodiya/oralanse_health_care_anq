const helpCenterController = require("../../../controller/enduser/clinic/help_center/help_center.controller.js");
const helpCenterServices = require("../../../controller/enduser/clinic/help_center/common.response.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/faqs", [authJwt.verifyHospitalToken], helpCenterController.getAllFaqQuestionAndAnswer)
};