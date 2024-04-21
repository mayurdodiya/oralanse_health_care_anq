const AmbulanceController = require("../../../controller/enduser/patient/ambulance/ambulance.controller");
const AmbulanceServices = require("../../../controller/enduser/patient/ambulance/service");
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

  app.get("/api/user/ambulancerequest", [authJwt.verifyUserToken], AmbulanceController.getAllAmbulanceRequest);
  app.post("/api/user/ambulancerequest", [authJwt.verifyUserToken], AmbulanceServices.requestValidation, AmbulanceController.sendAmbulanceRequest);

};
