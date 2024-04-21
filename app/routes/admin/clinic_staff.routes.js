const clinicStaffController = require("./../../controller/admin/clinic_staff/clinic_staff.controller");
const clinicCommonServices = require("./../../controller/admin/clinic_staff/common.services");
const authJwt = require("../../middleware/authjwt");
const multer = require("multer");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/clinicstaff", clinicCommonServices.addValidation, clinicStaffController.addStaff);
  app.put("/api/admin/clinicstaff/:slug", clinicCommonServices.addValidation, clinicStaffController.updateStaff);
  app.delete("/api/admin/clinicstaff/:slug", clinicStaffController.deleteClinicStaffById);
  app.get("/api/admin/clinicstaff/:slug", clinicStaffController.viewClinicStaffById);
  app.get("/api/admin/clinicstaff", clinicStaffController.viewAllClinicStaff);
};