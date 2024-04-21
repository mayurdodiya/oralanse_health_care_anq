const areasController = require("../../controller/admin/areas/areas.controller.js");
const areasCommonServices = require("../../controller/admin/areas/common.services.js");
const multer = require('multer');
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/areas",[authJwt.verifyAdminToken], areasCommonServices.addValidation, areasController.addAreas);
  app.put("/api/admin/areas/:id",[authJwt.verifyAdminToken], areasController.updateAreasById);
  app.delete("/api/admin/areas/:id",[authJwt.verifyAdminToken], areasController.deleteAreasById);
  app.get("/api/admin/areas/:id",[authJwt.verifyAdminToken], areasController.viewAreasById);
  app.get("/api/admin/areas",[authJwt.verifyAdminToken], areasController.viewAllAreas);
  app.post("/api/createpdf", areasController.createPdf);
  
};
