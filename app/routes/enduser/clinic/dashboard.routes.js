const dashboardController = require("../../../controller/enduser/clinic/dashboard/dashboard.controller.js");
const dashboardServices = require("../../../controller/enduser/clinic/dashboard/service.js");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/dashboard/productlisting", [authJwt.verifyHospitalToken], dashboardController.getTrendingProductList);
  app.get("/api/clinic/dashboard/ambulancelisting", [authJwt.verifyHospitalToken], dashboardController.getAmbulanceRequestList);
};
