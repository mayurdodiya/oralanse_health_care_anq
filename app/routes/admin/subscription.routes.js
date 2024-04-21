const subscriptionController = require("../../controller/admin/subscription/subscription.controller.js");
const subscriptionCommonServices = require("../../controller/admin/subscription/common.services.js");
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.get("/api/admin/subscription", [authJwt.verifyAdminToken], subscriptionController.viewAllSubscription);

};
