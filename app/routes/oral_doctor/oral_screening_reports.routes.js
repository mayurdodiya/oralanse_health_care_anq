const oralScreeningController = require("../../controller/oral_doctor/oral_screening_reports/oral_screening_reports.controller.js");
const oralScreeningCommonServices = require("../../controller/oral_doctor/oral_screening_reports/common.services.js");

const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  
  app.get("/api/oraldoctor/oralscreening", [authJwt.verifyOralDoctorToken], oralScreeningController.viewAllOralScreeningRequest);
  app.get("/api/oraldoctor/oralscreening/qa", [authJwt.verifyOralDoctorToken], oralScreeningController.viewAllQaQAassignedRequest);
  app.get("/api/oraldoctor/oralscreening/:id", [authJwt.verifyOralDoctorToken], oralScreeningController.viewScreeningReportById);
  app.get("/api/oraldoctor/oralscreening/assigneddoctor/:id", [authJwt.verifyOralDoctorToken], oralScreeningController.viewAssignedDoctorReportDetailById);
  app.get("/api/oraldoctor/oralscreening/qaassigned/:id", [authJwt.verifyOralDoctorToken], oralScreeningController.viewQaAssignedReportDetailById);
  app.post("/api/oraldoctor/oralscreening/notes/:id", [authJwt.verifyOralDoctorToken], oralScreeningController.addOralScreeningNotes);
  // app.get("/api/admin/oraldoctors", [authJwt.verifyOralDoctorToken], oralDoctorsController.viewAllOralDoctors);
  // app.post("/api/admin/oralscreening", [authJwt.verifyOralDoctorToken], oralScreeningController.shareOralScreeningReport);
  // app.get("/api/admin/oralscreening/status/:id", [authJwt.verifyOralDoctorToken], oralScreeningController.changeScreeningReportsStatusById);
};