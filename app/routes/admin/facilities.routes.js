const facilitiesController = require("../../controller/admin/facilities/facilities.controller.js");
const facilitiesCommonServices = require("../../controller/admin/facilities/common.services.js");
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

  

  app.post("/api/admin/facilities",[authJwt.verifyAdminToken], facilitiesCommonServices.addValidation, facilitiesController.addFacilities);
  app.put("/api/admin/facilities/:id",[authJwt.verifyAdminToken], facilitiesController.updateFacilitiesById);
  app.delete("/api/admin/facilities/:id",[authJwt.verifyAdminToken], facilitiesController.deleteFacilitiesById);
  app.get("/api/admin/facilities/:id",[authJwt.verifyAdminToken], facilitiesController.viewFacilitiesById);
  app.get("/api/admin/facilities",[authJwt.verifyAdminToken], facilitiesController.viewAllFacilities);
  
};
