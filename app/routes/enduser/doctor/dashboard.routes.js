const enduserController = require("../../../controller/enduser/doctor/dashboard/dashboard.controller.js");
const enduserServices = require("../../../controller/enduser/doctor/dashboard/service.js");
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

  app.get("/api/doctor/jobs", [authJwt.verifyDoctorToken], enduserController.jobListing);
  app.get("/api/doctor/productlisting", [authJwt.verifyDoctorToken], enduserController.getTrendingProductList);
  app.get("/api/doctor/consultationlisting", [authJwt.verifyDoctorToken], enduserController.consultationListing);  
  app.get("/api/doctor/privacypolicy", [authJwt.verifyDoctorToken], enduserController.viewDoctorPrivacyPolicyPage);  
};
