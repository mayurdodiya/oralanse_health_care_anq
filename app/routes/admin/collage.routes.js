const collageController = require("../../controller/admin/collage/collage.controller.js");
const collageCommonServices = require("../../controller/admin/collage/common.services.js");
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



  app.post("/api/admin/collage",[authJwt.verifyAdminToken], collageCommonServices.addValidation, collageController.addCollage);
  app.put("/api/admin/collage/:id",[authJwt.verifyAdminToken], collageController.updateCollageById);
  app.delete("/api/admin/collage/:id",[authJwt.verifyAdminToken], collageController.deleteCollageById);
  app.get("/api/admin/collage/:id",[authJwt.verifyAdminToken], collageController.viewCollageById);
  app.get("/api/admin/collage",[authJwt.verifyAdminToken], collageController.viewAllCollage);
  
};
