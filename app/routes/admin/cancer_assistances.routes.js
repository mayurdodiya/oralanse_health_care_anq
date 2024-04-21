const cancerAssistancesController = require("../../controller/admin/cancer_assistances/cancer_assistances.controller.js");
const cancerAssistancesCommonServices = require("../../controller/admin/cancer_assistances/common.services.js");
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


  app.post("/api/admin/cancerassistances",[authJwt.verifyAdminToken], cancerAssistancesCommonServices.addValidation, cancerAssistancesController.addCancerAssistances);
  app.put("/api/admin/cancerassistances/:slug",[authJwt.verifyAdminToken], cancerAssistancesController.updateCancerAssistancesById);
  app.delete("/api/admin/cancerassistances/:slug",[authJwt.verifyAdminToken], cancerAssistancesController.deleteCancerAssistancesById);
  app.get("/api/admin/cancerassistances/:slug",[authJwt.verifyAdminToken], cancerAssistancesController.viewCancerAssistancesById);
  app.get("/api/admin/cancerassistances",[authJwt.verifyAdminToken], cancerAssistancesController.viewAllCancerAssistances);  
};
