const healthAssessmentReportController = require("../../controller/admin/health_assessment_report/health_assessment_report.controller.js");
const healthAssessmentReportCommonServices = require("../../controller/admin/health_assessment_report/common.services.js");
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



  app.get("/api/admin/healthassessment/employee", [authJwt.verifyAdminToken], healthAssessmentReportController.viewAllEmployee);
  app.get("/api/admin/healthassessment/employeeassement/:slug", [authJwt.verifyAdminToken], healthAssessmentReportController.viewEmployeeAllAssementHistory);
  app.get("/api/admin/healthassessment/healthassessmentreport/:slug", [authJwt.verifyAdminToken], healthAssessmentReportController.viewEmployeeAssementHistoryDetail);

};
