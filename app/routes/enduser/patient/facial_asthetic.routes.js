const facialAstheticController = require("../../../controller/enduser/patient/facialAsthetic/facial_asthetic.controller");
const facialAstheticServices = require("../../../controller/enduser/patient/facialAsthetic/service");

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

  app.get("/api/user/facialtreatment", [authJwt.verifyUserToken], facialAstheticController.getAllFacialTreatment)
  app.get("/api/user/astheticclinic", [authJwt.verifyUserToken], facialAstheticController.getFacialAstheticClinicList)
  app.get("/api/user/astheticclinic/:slug", [authJwt.verifyUserToken], facialAstheticController.viewFacialAstheticClinicById)

};
