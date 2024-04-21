const pharmaciesController = require("../../controller/admin/pharmacies/pharmacies.controller.js");
const pharmaciesCommonServices = require("../../controller/admin/pharmacies/common.services.js");
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



  app.post("/api/admin/pharmacies",[authJwt.verifyAdminToken], pharmaciesCommonServices.addValidation, pharmaciesController.addPharmacies);
  app.put("/api/admin/pharmacies/:id",[authJwt.verifyAdminToken], pharmaciesController.updatePharmaciesById);
  app.put("/api/admin/pharmacystatus/:id", [authJwt.verifyAdminToken], pharmaciesController.updatePharmaciesStatus);
  app.delete("/api/admin/pharmacies/:id",[authJwt.verifyAdminToken], pharmaciesController.deletePharmaciesById);
  app.get("/api/admin/pharmacies/:id",[authJwt.verifyAdminToken], pharmaciesController.viewPharmaciesById);
  app.get("/api/admin/pharmacies",[authJwt.verifyAdminToken], pharmaciesController.viewAllPharmacies);
  
};
