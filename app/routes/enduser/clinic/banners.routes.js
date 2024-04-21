const bannersController = require("../../../controller/enduser/clinic/banners/banners.controller.js");
const bannersServices = require("../../../controller/enduser/clinic/banners/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/banners", [authJwt.verifyHospitalToken], bannersController.viewAllBanners);
};
