const bannersController = require("../../controller/admin/banners/banners.controller.js");
const bannersCommonServices = require("../../controller/admin/banners/common.services.js");
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



  app.post("/api/admin/banners",[authJwt.verifyAdminToken], bannersCommonServices.addValidation, bannersController.addBanners);
  app.put("/api/admin/banners/:id",[authJwt.verifyAdminToken], bannersController.updateBannersById);
  app.delete("/api/admin/banners/:id",[authJwt.verifyAdminToken], bannersController.deleteBannersById);
  app.get("/api/admin/banners/:id",[authJwt.verifyAdminToken], bannersController.viewBannersById);
  app.get("/api/admin/banners",[authJwt.verifyAdminToken], bannersController.viewAllBanners);
  
};
