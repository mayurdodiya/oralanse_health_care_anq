const healthAssessmentsController = require("../../controller/admin/health_assessments/health_assessments.controller.js");
const healthAssessmentsCommonServices = require("../../controller/admin/health_assessments/common.services.js");
const authJwt = require("../../middleware/authjwt.js");
const multer = require('multer');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/admin/healthassessments",[authJwt.verifyAdminToken], healthAssessmentsCommonServices.addValidation, healthAssessmentsController.addHealthAssessments);
  app.put("/api/admin/healthassessments/:id",[authJwt.verifyAdminToken], healthAssessmentsController.updateHealthAssessmentsById);
  app.delete("/api/admin/healthassessments/:id",[authJwt.verifyAdminToken], healthAssessmentsController.deleteHealthAssessmentsById);
  app.get("/api/admin/healthassessments/:id",[authJwt.verifyAdminToken], healthAssessmentsController.viewHealthAssessmentsById);
  app.get("/api/admin/healthassessments",[authJwt.verifyAdminToken], healthAssessmentsController.viewAllHealthAssessments);  
};
