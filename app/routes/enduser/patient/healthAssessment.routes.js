const healthAssessmentController = require("../../../controller/enduser/patient/healthAssessment/healthAssessment.controller");
const healthAssessmentServices = require("../../../controller/enduser/patient/healthAssessment/service");
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

  app.get("/api/user/healthassessmentlist", [authJwt.verifyUserToken], healthAssessmentController.getHealtAssessmentList);
  app.get("/api/user/healthassessmentquiz/:id", [authJwt.verifyUserToken], healthAssessmentController.getHealthAssessmentQuiz);
  app.post("/api/user/healthassessmentanswer/:id", [authJwt.verifyUserToken], healthAssessmentController.submitHealthAssessmentQuiz);
  app.get("/api/user/healthassessment/:id", [authJwt.verifyUserToken], healthAssessmentController.getHealthAssessmentReportList);
  app.get("/api/user/healthassessmentreport/:id", [authJwt.verifyUserToken], healthAssessmentController.getSelfAssesmentReport);

};
