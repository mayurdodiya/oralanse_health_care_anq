const healthTrackerController = require("../../../controller/enduser/patient/HealthTracker/health_tracker.controller");
const healthTrackerServices = require("../../../controller/enduser/patient/HealthTracker/service");
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

  app.post("/api/user/trackbloodpressure", [authJwt.verifyUserToken], healthTrackerController.addNewBloodPressure);
  app.post("/api/user/trackbloodsugar", [authJwt.verifyUserToken], healthTrackerController.addNewBloodSugar);
  app.get("/api/user/healthtracker", [authJwt.verifyUserToken], healthTrackerController.getTrackingRecord);
  app.get("/api/user/trackbloodsugar", [authJwt.verifyUserToken], healthTrackerController.viewBloodSugarRecord);
  app.get("/api/user/trackbloodpressure", [authJwt.verifyUserToken], healthTrackerController.viewBloodPressureRecord);

};
