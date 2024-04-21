const ambulanceController = require("../../../controller/enduser/clinic/ambulance/ambulance.controller.js");
const ambulanceServices = require("../../../controller/enduser/clinic/ambulance/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/clinic/ambulance", [authJwt.verifyHospitalToken], ambulanceServices.addValidation, ambulanceController.addAmbulance);
  app.put("/api/clinic/ambulance/:id", [authJwt.verifyHospitalToken], ambulanceController.updateAmbulanceById);
  app.delete("/api/clinic/ambulance/:id", [authJwt.verifyHospitalToken], ambulanceController.deleteAmbulanceById);
  app.get("/api/clinic/ambulance", [authJwt.verifyHospitalToken], ambulanceController.viewAllAmbulance);
  app.get("/api/clinic/ambulance/:id", [authJwt.verifyHospitalToken], ambulanceController.viewAmbulanceById);
  app.get("/api/clinic/ambulance/request", [authJwt.verifyHospitalToken], ambulanceController.viewAmbulanceAllRequest);
  app.post("/api/clinic/ambulance/request/:id", [authJwt.verifyHospitalToken], ambulanceController.changeAmbulanceRequestStatus);
};