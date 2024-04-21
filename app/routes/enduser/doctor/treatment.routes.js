const treatmentController = require("../../../controller/enduser/doctor/treatment/treatment.controller.js");
const treatmentServices = require("../../../controller/enduser/doctor/treatment/service.js");
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

  app.post("/api/doctor/treatment", [authJwt.verifyDoctorToken], treatmentServices.addValidation, treatmentController.addClinicTreatment);
  app.put("/api/doctor/treatment/:id", [authJwt.verifyDoctorToken], treatmentController.updateClinicTreatment);
  app.delete("/api/doctor/treatment/:id", [authJwt.verifyDoctorToken], treatmentController.deleteClinicTreatment);
  app.get("/api/doctor/treatment/:id", [authJwt.verifyDoctorToken], treatmentController.viewAllClinicTreatments);
};