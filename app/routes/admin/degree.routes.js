const degreeController = require("../../controller/admin/degree/degree.controller.js");
const degreeCommonServices = require("../../controller/admin/degree/common.services.js");
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



  app.post("/api/admin/degree",[authJwt.verifyAdminToken], degreeCommonServices.addValidation, degreeController.addDegree);
  app.put("/api/admin/degree/:id",[authJwt.verifyAdminToken], degreeController.updateDegreeById);
  app.delete("/api/admin/degree/:id",[authJwt.verifyAdminToken], degreeController.deleteDegreeById);
  app.get("/api/admin/degree/:id",[authJwt.verifyAdminToken], degreeController.viewDegreeById);
  app.get("/api/admin/degree",[authJwt.verifyAdminToken], degreeController.viewAllDegree);
  
};
