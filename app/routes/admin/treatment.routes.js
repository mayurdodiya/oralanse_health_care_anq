const treamentController = require("../../controller/admin/treament/treatment.controller");
const treamentCommonServices = require("../../controller/admin/treament/common.services");
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

  
 app.post("/api/admin/treatment", [authJwt.verifyAdminToken],treamentCommonServices.addValidation, treamentController.addTreatment);
 app.put("/api/admin/treatment/:id", [authJwt.verifyAdminToken], treamentController.updateTreatmentById);
 app.put("/api/admin/treatmentstatus/:id", [authJwt.verifyAdminToken], treamentController.updateTreatmentStatus);
 app.delete("/api/admin/deleteservices/:id", [authJwt.verifyAdminToken], treamentController.deleteTreatmentById);
 app.get("/api/admin/treatment", [authJwt.verifyAdminToken], treamentController.viewAllTreatment);
 app.get("/api/admin/treatment/:id", [authJwt.verifyAdminToken], treamentController.viewTreatmentById);
};
 