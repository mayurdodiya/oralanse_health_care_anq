const HomeVisitController = require("../../../controller/enduser/patient/HomeVisit/home_visit.controller");
const HomeVisitServices = require("../../../controller/enduser/patient/HomeVisit/service");

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

  app.get("/api/user/homevisitclinic", [authJwt.verifyUserToken], HomeVisitController.getHomeVisitClinicList)

};
