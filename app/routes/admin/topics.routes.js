const topicsController = require("../../controller/admin/topics/topics.controller.js");
const topicsCommonServices = require("../../controller/admin/topics/common.services.js");
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



  app.post("/api/admin/topics", [authJwt.verifyAdminToken], topicsCommonServices.addValidation, topicsController.addTopics);
  app.put("/api/admin/topics/:slug", [authJwt.verifyAdminToken], topicsController.updateTopicsById);
  app.delete("/api/admin/topics/:slug", [authJwt.verifyAdminToken], topicsController.deleteTopicsById);
  app.get("/api/admin/topics/:slug", [authJwt.verifyAdminToken], topicsController.viewTopicsById);
  app.get("/api/admin/topics", [authJwt.verifyAdminToken], topicsController.viewAllTopics);

};
