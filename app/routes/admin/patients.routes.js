const patientController = require("./../../controller/admin/patient/patient.controller");
const patientCommonServices = require("./../../controller/admin/patient/common.services");
const authJwt = require("../../middleware/authjwt");
var multer = require("multer")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });




  app.post("/api/admin/patients", [authJwt.verifyAdminToken], patientCommonServices.addValidation, patientController.addPatient);
  app.put("/api/admin/patients/:slug", [authJwt.verifyAdminToken], patientController.updatePatientById);
  app.put("/api/admin/patientstatus/:slug", [authJwt.verifyAdminToken], patientController.updatePatientStatus);
  app.delete("/api/admin/patients/:slug", [authJwt.verifyAdminToken], patientController.deletePatientById);
  app.get("/api/admin/patients/exportexcel", [authJwt.verifyAdminToken], patientController.exportPatientDetailsInExcel);
  app.get("/api/admin/patients", [authJwt.verifyAdminToken], patientController.viewAllPatient);
  app.get("/api/admin/patients/:slug", [authJwt.verifyAdminToken], patientController.viewPatientById);
  app.get("/api/admin/patients/patientappointment/:slug", [authJwt.verifyAdminToken], patientController.viewAppointmentHistory);
  app.get("/api/admin/patients/patientpresciption/:slug", [authJwt.verifyAdminToken], patientController.viewPresciptionDetails);
};