const financialDashboardController = require("../../controller/admin/financial_dashboard/financial_dashboard.controller.js");
const financialDashboardCommonServices = require("../../controller/admin/financial_dashboard/common.services.js");
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.get("/api/admin/financialdashboard", [authJwt.verifyAdminToken], financialDashboardController.viewFinancialDashboard);
};