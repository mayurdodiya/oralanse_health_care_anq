const clinicsController = require("./../../controller/admin/clinic/clinics.controller");
const clinicsCommonServices = require("./../../controller/admin/clinic/common.services");
const authJwt = require("../../middleware/authjwt");
const multer = require("multer")

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/clinics", [authJwt.verifyAdminToken], clinicsCommonServices.addValidation, clinicsController.addClinic);
  app.put("/api/admin/clinics/:slug", [authJwt.verifyAdminToken], clinicsController.updateClinicsById);
  app.put("/api/admin/clinicsstatus/:slug", [authJwt.verifyAdminToken], clinicsController.updateClinicStatus);
  app.put("/api/admin/clinics/approveprofile/:id", [authJwt.verifyAdminToken], clinicsController.approveClinicProfile);
  app.delete("/api/admin/clinics/:clinic_id", [authJwt.verifyAdminToken], clinicsController.deleteClinicsById);
  app.get("/api/admin/clinics/exportexcel", [authJwt.verifyAdminToken], clinicsController.exportClinicDetailsInExcel);
  app.get("/api/admin/clinics/:clinic_id", [authJwt.verifyAdminToken], clinicsController.viewClinicsById);
  app.get("/api/admin/clinics", [authJwt.verifyAdminToken], clinicsController.viewAllClinics);
};