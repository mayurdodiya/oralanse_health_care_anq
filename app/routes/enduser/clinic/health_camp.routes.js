const healthCampSpaceController = require("../../../controller/enduser/clinic/health_camp/health_camp.controller.js");
const healthCampSpaceServices = require("../../../controller/enduser/clinic/health_camp/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/clinic/healthcamp", [authJwt.verifyHospitalToken], healthCampSpaceServices.addValidation, healthCampSpaceController.addHealthCamp);
  app.put("/api/clinic/healthcamp/:id", [authJwt.verifyHospitalToken], healthCampSpaceController.updateHealthCamp);
  app.delete("/api/clinic/healthcamp/:id", [authJwt.verifyHospitalToken], healthCampSpaceController.deleteHealthCamp);
  app.get("/api/clinic/healthcamp", [authJwt.verifyHospitalToken], healthCampSpaceController.viewAllHealthCamp);
  app.get("/api/clinic/healthcamppatients/:id", [authJwt.verifyHospitalToken], healthCampSpaceController.viewAllHealthCampPatients);
};
