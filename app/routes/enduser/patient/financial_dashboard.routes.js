const financialDashboardController = require("../../../controller/enduser/patient/financial_dashboard/financial_dashboard.controller.js");
const financialDashboardServices = require("../../../controller/enduser/patient/financial_dashboard/service.js");
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


  app.get("/api/user/transaction", [authJwt.verifyUserToken], financialDashboardController.viewAllTransaction);
};
