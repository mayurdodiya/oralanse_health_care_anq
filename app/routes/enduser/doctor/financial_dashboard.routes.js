const financialDashboardController = require("../../../controller/enduser/doctor/financial_dashboard/financial_dashboard.controller.js");
const financialDashboardServices = require("../../../controller/enduser/doctor/financial_dashboard/service.js");
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

  app.get("/api/doctor/transactions", [authJwt.verifyDoctorToken], financialDashboardController.viewTransactionHistory);  
  app.get("/api/doctor/withdraw", [authJwt.verifyDoctorToken], financialDashboardController.viewWithdrawRequestHistory);  
  app.post("/api/doctor/withdrawrequest", [authJwt.verifyDoctorToken], financialDashboardController.addWithdrawRequest);  
};
