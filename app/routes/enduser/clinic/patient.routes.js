const patientController = require("../../../controller/enduser/clinic/patient/patient.controller.js");
const patientRequestController = require("../../../controller/enduser/doctor/patient_request/patient_request.controller.js");
const patientServices = require("../../../controller/enduser/clinic/patient/service.js");
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

  app.get("/api/clinic/patientslist", [authJwt.verifyHospitalToken], patientController.getPatientList);
  app.get("/api/clinic/patientshealthrecords", [authJwt.verifyHospitalToken], patientController.getHealthRecoards);
  app.post("/api/clinic/addpatients", [authJwt.verifyHospitalToken], patientServices.addValidation, patientController.addPatient);
  app.put("/api/clinic/patients/:id", [authJwt.verifyHospitalToken], patientController.updatePatientById);
  app.get("/api/clinic/patients/:id", [authJwt.verifyHospitalToken], patientController.viewPatientById);
  app.post("/api/clinic/patientsugar", [authJwt.verifyHospitalToken], patientServices.addSugarValidation, patientController.addPatientSugar);
  app.get("/api/clinic/patientsugar/:id", [authJwt.verifyHospitalToken], patientController.viewPatientAllSugar);
  app.get("/api/clinic/patientheartrate/:id", [authJwt.verifyHospitalToken], patientController.viewPatientAllHeartrate);
  app.post("/api/clinic/patientheartrate", [authJwt.verifyHospitalToken], patientServices.addHreartRateValidation, patientController.addPatientHeartRate);
  app.get("/api/clinic/patientheightweight/:id", [authJwt.verifyHospitalToken], patientController.viewPatientAllHeightWeight);
  app.post("/api/clinic/patientheightweight", [authJwt.verifyHospitalToken], patientServices.addHeightWeightValidation, patientController.addPatientHeightWeight);
  app.get("/api/clinic/patienturinoutput/:id", [authJwt.verifyHospitalToken], patientController.viewPatientAllUrineOutput);
  app.post("/api/clinic/patienturinoutput", [authJwt.verifyHospitalToken], patientServices.addUrineOutputValidation, patientController.addPatientUrinOutput);
  app.get("/api/clinic/patientbloodpressure/:id", [authJwt.verifyHospitalToken], patientController.viewPatientAllBloodPressure);
  app.post("/api/clinic/patientbloodpressure", [authJwt.verifyHospitalToken], patientServices.addBloodPressureValidation, patientController.addPatientBloodPressure);
  app.get("/api/clinic/pasthistory/:slug", [authJwt.verifyHospitalToken], patientRequestController.viewPatientPastHistoryListing);
};