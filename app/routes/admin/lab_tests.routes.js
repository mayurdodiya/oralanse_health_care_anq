const labTestsController = require("../../controller/admin/lab_tests/lab_tests.controller.js");
const labTestsCommonServices = require("../../controller/admin/lab_tests/common.services.js");
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


  
  app.post("/api/admin/labtests",[authJwt.verifyAdminToken], labTestsCommonServices.addValidation, labTestsController.addLabTests);
  app.put("/api/admin/labtests/:id",[authJwt.verifyAdminToken], labTestsController.updateLabTestsById);
  app.delete("/api/admin/labtests/:id",[authJwt.verifyAdminToken], labTestsController.deleteLabTestsById);
  app.get("/api/admin/labtests/:id",[authJwt.verifyAdminToken], labTestsController.viewLabTestsById);
  app.get("/api/admin/labtests",[authJwt.verifyAdminToken], labTestsController.viewAllLabTests);
  
};
