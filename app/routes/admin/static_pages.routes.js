const staticPageController = require("../../controller/admin/static_pages/static_pages.controller.js");
const staticPageCommonServices = require("../../controller/admin/static_pages/common.services.js");
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


  app.post("/api/admin/staticpage",[authJwt.verifyAdminToken], staticPageCommonServices.addValidation, staticPageController.addStaticPage);
  app.put("/api/admin/staticpage/:slug",[authJwt.verifyAdminToken], staticPageController.updateStaticPageById);
  app.delete("/api/admin/staticpage/:slug",[authJwt.verifyAdminToken], staticPageController.deleteStaticPageById);
  app.get("/api/admin/staticpage/:slug",[authJwt.verifyAdminToken], staticPageController.viewStaticPageById);
  app.get("/api/admin/staticpage",[authJwt.verifyAdminToken], staticPageController.viewAllStaticPage);  
};
