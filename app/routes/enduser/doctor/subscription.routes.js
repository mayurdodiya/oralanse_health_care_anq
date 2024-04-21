const subscriptionController = require("../../../controller/enduser/doctor/subscription/subscription.controller.js");
const subscriptionServices = require("../../../controller/enduser/doctor/subscription/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) { 
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.get("/api/doctor/subscription", [authJwt.verifyDoctorToken], subscriptionController.viewAllSubscription);
};