const sosController = require("../../../controller/enduser/clinic/sos/sos.controller.js");
const sossServices = require("../../../controller/enduser/clinic/sos/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/clinic/sos", [authJwt.verifyHospitalToken], sossServices.addValidation, sosController.addEmergencyContact);
  app.put("/api/clinic/sos/:id", [authJwt.verifyHospitalToken], sosController.updateEmergencyContact);
  app.delete("/api/clinic/sos/:id", [authJwt.verifyHospitalToken], sosController.deleteEmergencyContact);
  app.get("/api/clinic/sos", [authJwt.verifyHospitalToken], sosController.getAllSosNumber);
};
