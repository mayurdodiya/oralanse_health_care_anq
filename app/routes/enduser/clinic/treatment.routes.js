const treatmentController = require("../../../controller/enduser/clinic/treatment/treatment.controller.js");
const treatmentServices = require("../../../controller/enduser/clinic/treatment/service.js");
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

  app.get("/api/clinic/treatment/:id", [authJwt.verifyHospitalToken], treatmentController.viewClinicTreatmentById);
  app.post("/api/clinic/treatment", [authJwt.verifyHospitalToken], treatmentServices.addValidation, treatmentController.addTreatment);
  app.put("/api/clinic/treatment/:id", [authJwt.verifyHospitalToken], treatmentController.updateTreatment);
  app.delete("/api/clinic/treatment/:id", [authJwt.verifyHospitalToken], treatmentController.deleteTreatment);
  app.get("/api/clinic/treatment", [authJwt.verifyHospitalToken], treatmentController.viewAllTreatments);
};