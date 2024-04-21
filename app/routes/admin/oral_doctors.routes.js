const oralDoctorsController = require("../../controller/admin/oral_doctor/oral_doctor.controller");
const oralDoctorsCommonServices = require("../../controller/admin/oral_doctor/common.services");
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




  app.post("/api/admin/oraldoctors", [authJwt.verifyAdminToken], oralDoctorsCommonServices.addValidation, oralDoctorsController.addOralDoctors);
  app.put("/api/admin/oraldoctors/:slug", [authJwt.verifyAdminToken], oralDoctorsController.updateOralDoctorsById);
  app.put("/api/admin/oraldoctorsstatus/:slug", [authJwt.verifyAdminToken], oralDoctorsController.updateOralDoctorStatus);
  app.delete("/api/admin/oraldoctors/:slug", [authJwt.verifyAdminToken], oralDoctorsController.deleteOralDoctorsById);
  app.get("/api/admin/oraldoctors/exportexcel", oralDoctorsController.exportDoctorDetailsInExcel);
  app.get("/api/admin/oraldoctors/:slug", [authJwt.verifyAdminToken], oralDoctorsController.viewOralDoctorById);
  app.get("/api/admin/oraldoctors", [authJwt.verifyAdminToken], oralDoctorsController.viewAllOralDoctors);


};
