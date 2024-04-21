const subadminController = require("../../controller/admin/subadmin/subadmin.controller.js");
const subadminCommonServices = require("../../controller/admin/subadmin/common.services.js");
const authJwt = require("../../middleware/authjwt");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/admin/subadmin", [authJwt.verifyAdminToken], subadminCommonServices.addValidation, subadminController.addSubAdmin);
  app.put("/api/admin/subadmin/:slug", [authJwt.verifyAdminToken], subadminController.updateSubAdminById);
  app.put("/api/admin/subadminstatus/:slug", [authJwt.verifyAdminToken], subadminController.updateSubAdminStatus);
  app.delete("/api/admin/subadmin/:slug", [authJwt.verifyAdminToken], subadminController.deleteSubAdminById);
  // app.get("/api/admin/subadmin/exportdata", subadminController.exportSubadminDetailsInExcel);
  app.get("/api/admin/subadmin", [authJwt.verifyAdminToken], subadminController.viewAllSubAdmin);
  app.get("/api/admin/subadmin/:slug", [authJwt.verifyAdminToken], subadminController.viewSubAdminById);
};