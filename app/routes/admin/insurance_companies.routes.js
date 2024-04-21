const insuranceCompanyController = require("../../controller/admin/insurance_companies/insurance_companies.controller.js");
const insuranceCompanyCommonServices = require("../../controller/admin/insurance_companies/common.services.js");
const authJwt = require("../../middleware/authjwt.js");
const multer = require('multer');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/admin/insurancecompany", [authJwt.verifyAdminToken], insuranceCompanyCommonServices.addValidation, insuranceCompanyController.addInsuranceCompany);
  app.put("/api/admin/insurancecompany/:id", [authJwt.verifyAdminToken], insuranceCompanyController.updateInsuranceCompanyById);
  app.delete("/api/admin/insurancecompany/:id", [authJwt.verifyAdminToken], insuranceCompanyController.deleteInsuranceCompanyById);
  app.get("/api/admin/insurancecompany/:id", [authJwt.verifyAdminToken], insuranceCompanyController.viewInsuranceCompanyById);
  app.get("/api/admin/insurancecompany", [authJwt.verifyAdminToken], insuranceCompanyController.viewAllInsuranceCompany);
  app.get("/api/insurancecompany", insuranceCompanyController.insuranceCompanies);

};
