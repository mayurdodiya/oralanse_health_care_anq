const oralDoctorsController = require("../../controller/admin/oral_doctor/oral_doctor.controller.js");
const oralScreeningController = require("../../controller/admin/oral_screening_reports/oral_screening_reports.controller.js");
const oralScreeningCommonServices = require("../../controller/admin/oral_screening_reports/common.services.js");
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.get("/api/admin/oralscreening", [authJwt.verifyAdminToken], oralScreeningController.viewAllOralScreeningReports);
  app.get("/api/admin/oraldoctors", [authJwt.verifyAdminToken], oralDoctorsController.viewAllOralDoctors);
  app.post("/api/admin/oralscreening", [authJwt.verifyAdminToken], oralScreeningController.shareOralScreeningReport);
  app.get("/api/admin/oralscreening/assigneddoctor/:id", [authJwt.verifyAdminToken], oralScreeningController.viewAssignedDoctorReportDetailById);
  app.get("/api/admin/oralscreening/qaassigned/:id", [authJwt.verifyAdminToken], oralScreeningController.viewQaAssignedReportDetailById);
  app.get("/api/admin/oralscreening/status/:id", [authJwt.verifyAdminToken], oralScreeningController.changeScreeningReportsStatusById);
  app.get("/api/admin/oralscreening/:id", [authJwt.verifyAdminToken], oralScreeningController.viewScreeningReportById);
};