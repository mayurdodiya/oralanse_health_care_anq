const promocodsController = require("../../controller/admin/promocods/promocods.controller.js");
const promocodsCommonServices = require("../../controller/admin/promocods/common.services.js");
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



  app.post("/api/admin/promocods", [authJwt.verifyAdminToken], promocodsCommonServices.addValidation, promocodsController.addPromocods);
  app.put("/api/admin/promocods/:id", [authJwt.verifyAdminToken], promocodsController.updatePromocodsById);
  app.put("/api/admin/promocodsstatus/:id", [authJwt.verifyAdminToken], promocodsController.updatePromocodsStatus);
  app.delete("/api/admin/promocods/:id", [authJwt.verifyAdminToken], promocodsController.deletePromocodsById);
  app.get("/api/admin/promocods/:id", [authJwt.verifyAdminToken], promocodsController.viewPromocodsById);
  app.get("/api/admin/promocods", [authJwt.verifyAdminToken], promocodsController.viewAllPromocods);

};
