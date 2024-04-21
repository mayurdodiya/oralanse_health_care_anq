const diseasesController = require("../../controller/admin/diseases/diseases.controller.js");
const diseasesCommonServices = require("../../controller/admin/diseases/common.services.js");
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



  app.post("/api/admin/diseases",[authJwt.verifyAdminToken], diseasesCommonServices.addValidation, diseasesController.addDiseases);
  app.put("/api/admin/diseases/:id",[authJwt.verifyAdminToken], diseasesController.updateDiseasesById);
  app.delete("/api/admin/diseases/:id",[authJwt.verifyAdminToken], diseasesController.deleteDiseasesById);
  app.get("/api/admin/diseases/:id",[authJwt.verifyAdminToken], diseasesController.viewDiseasesById);
  app.get("/api/admin/diseases",[authJwt.verifyAdminToken], diseasesController.viewAllDiseases);
  
};
