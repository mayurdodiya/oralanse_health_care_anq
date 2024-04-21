const labTestController = require("../../../controller/enduser/patient/labTest/labtest.controller");
const labTextServices = require("../../../controller/enduser/patient/labTest/service");
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

  app.get("/api/patient/labtest", [authJwt.verifyUserToken], labTestController.getAllLabReportList);
  app.get("/api/patient/labtestclinic", [authJwt.verifyUserToken], labTestController.getHospitalListForLabTest);
  app.get("/api/patient/labtestclinic/:slug", [authJwt.verifyUserToken], labTestController.viewHospitalById);
  app.post("/api/patient/labtest/labpayment", [authJwt.verifyUserToken], labTestController.createLabtestPayment);
  app.post("/api/patient/labtest/verifylabpayment", [authJwt.verifyUserToken], labTestController.verifyLabPayment);
  app.post("/api/patient/labtest/booklabappointment", [authJwt.verifyUserToken], labTestController.bookLabReportAppointment);
  app.get("/api/patient/labtestappointment", [authJwt.verifyUserToken], labTestController.viewLabAppointmentList);

};
