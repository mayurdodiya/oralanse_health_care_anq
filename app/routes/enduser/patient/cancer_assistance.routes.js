const CancerAssitanceController = require("../../../controller/enduser/patient/cancerAssistance/cancer_assistance.controller");
const CancerAsistanceServices = require("../../../controller/enduser/patient/cancerAssistance/service");
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

  app.get("/api/user/cancerassistance", [authJwt.verifyUserToken], CancerAssitanceController.getAllCancerAssistance);
  app.get("/api/user/cancerassistance/:slug", [authJwt.verifyUserToken], CancerAssitanceController.viewCancerAssitanceById);

};
