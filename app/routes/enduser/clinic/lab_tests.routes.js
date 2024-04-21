const labReportsController = require("../../../controller/enduser/clinic/lab_tests/lab_tests.controller.js");
const labReportsServices = require("../../../controller/enduser/clinic/lab_tests/service.js");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/clinic/labtests", [authJwt.verifyHospitalToken], labReportsServices.addJobValidation, labReportsController.addLabTests);
  app.put("/api/clinic/labtests/:id", [authJwt.verifyHospitalToken], labReportsController.updateLabTests);
  app.delete("/api/clinic/labtests/:id", [authJwt.verifyHospitalToken], labReportsController.deleteLabTests);
  app.get("/api/clinic/labtests/:id", [authJwt.verifyHospitalToken], labReportsController.viewClinicLabTestById);
  app.get("/api/clinic/labtests", [authJwt.verifyHospitalToken], labReportsController.getClinicAllLabTest);
  app.get("/api/clinic/labtestsrequest", [authJwt.verifyHospitalToken], labReportsController.viewAllLabTestRequest);
  app.post("/api/clinic/requeststatus/:id", [authJwt.verifyHospitalToken], labReportsController.acceptAndDeclineRequest);
  app.post("/api/clinic/testvalue/:id", [authJwt.verifyHospitalToken], labReportsController.addTestValueForPatient);
};