const doctorsController = require("../../controller/admin/doctor/doctors.controller");
const doctorCommonServices = require("../../controller/admin/doctor/common.services");
const multer = require('multer');
const authJwt = require("../../middleware/authjwt");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });




  app.post("/api/admin/doctors", [authJwt.verifyAdminToken], doctorCommonServices.addValidation, doctorsController.addDoctors);
  app.put("/api/admin/doctors/:slug", [authJwt.verifyAdminToken], doctorsController.updateDoctorsById);
  app.put("/api/admin/doctoractive/:slug", [authJwt.verifyAdminToken], doctorsController.activeInactiveDoctorStatus);
  app.put("/api/admin/doctor/approveprofile/:slug", [authJwt.verifyAdminToken], doctorCommonServices.approveProfileValidation, doctorsController.approveDoctorProfile);
  app.delete("/api/admin/doctors/:slug", [authJwt.verifyAdminToken], doctorsController.deleteDoctorsById);
  app.get("/api/admin/doctors/exportexcel", [authJwt.verifyAdminToken], doctorsController.exportDoctorDetailsInExcel);
  app.get("/api/admin/doctors/importexcel", [authJwt.verifyAdminToken], doctorsController.importDoctorDetailFromExcel);
  app.get("/api/admin/doctors/:slug", [authJwt.verifyAdminToken], doctorsController.viewDoctorById);
  app.get("/api/admin/doctors", [authJwt.verifyAdminToken], doctorsController.viewAllDoctors);
};