const specialistController = require("../../controller/admin/specialities/specialities.controller.js");
const specialistCommonServices = require("../../controller/admin/specialities/common.services.js");
const multer = require('multer');
const authJwt = require("../../middleware/authjwt");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/specialities",[authJwt.verifyAdminToken], specialistCommonServices.addValidation, specialistController.addSpecialists);
  app.put("/api/admin/specialities/:id",[authJwt.verifyAdminToken], specialistController.updateSpecialistsById);
  app.put("/api/admin/specialitiesstatus/:id", [authJwt.verifyAdminToken], specialistController.updateSpecialistsStatus);
  app.delete("/api/admin/specialities/:id",[authJwt.verifyAdminToken], specialistController.deleteSpecialistsById);
  app.get("/api/admin/specialities/:id",[authJwt.verifyAdminToken], specialistController.viewSpecialistsById);
  app.get("/api/admin/specialities",[authJwt.verifyAdminToken], specialistController.viewAllSpecialists);
  
};
