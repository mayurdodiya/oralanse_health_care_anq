const financialDashboardController = require("../../../controller/enduser/clinic/financial_dashboard/financial_dashboard.controller.js");
const financialDashboardServices = require("../../../controller/enduser/clinic/financial_dashboard/service.js");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/transactions", [authJwt.verifyHospitalToken], financialDashboardController.viewTransactionHistory);  
  app.get("/api/clinic/withdraw", [authJwt.verifyHospitalToken], financialDashboardController.viewWithdrawRequestHistory);  
};
