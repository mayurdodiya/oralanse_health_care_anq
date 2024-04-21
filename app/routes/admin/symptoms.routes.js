const symptomsController = require("../../controller/admin/symptoms/symptoms.controller.js");
const symptomsCommonServices = require("../../controller/admin/symptoms/common.services.js");
const authJwt = require("../../middleware/authjwt.js");
const multer = require('multer');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/symptoms",[authJwt.verifyAdminToken], symptomsCommonServices.addValidation, symptomsController.addSymptoms);
  app.put("/api/admin/symptoms/:id",[authJwt.verifyAdminToken], symptomsController.updateSymptomsById);
  app.delete("/api/admin/symptoms/:id",[authJwt.verifyAdminToken], symptomsController.deleteSymptomsById);
  app.get("/api/admin/symptoms/:id",[authJwt.verifyAdminToken], symptomsController.viewSymptomsById);
  app.get("/api/admin/symptoms",[authJwt.verifyAdminToken], symptomsController.viewAllSymptoms);
  
};
