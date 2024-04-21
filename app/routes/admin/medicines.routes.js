const medicinesController = require("../../controller/admin/medicines/medicines.controller.js");
const medicinesCommonServices = require("../../controller/admin/medicines/common.services.js");
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



  app.post("/api/admin/medicines",[authJwt.verifyAdminToken], medicinesCommonServices.addValidation, medicinesController.addMedicines);
  app.put("/api/admin/medicines/:slug",[authJwt.verifyAdminToken], medicinesController.updateMedicinesById);
  app.delete("/api/admin/medicines/:slug",[authJwt.verifyAdminToken], medicinesController.deleteMedicinesById);
  app.get("/api/admin/medicines/:slug",[authJwt.verifyAdminToken], medicinesController.viewMedicinesById);
  app.get("/api/admin/medicines",[authJwt.verifyAdminToken], medicinesController.viewAllMedicines);
  
};
