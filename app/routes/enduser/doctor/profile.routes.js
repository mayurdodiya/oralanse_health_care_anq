const profileController = require("../../../controller/enduser/doctor/profile/profile.controller");
const profileServices = require("../../../controller/enduser/doctor/profile/service");
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

  app.post("/api/doctor/profile", [authJwt.verifyUserToken], profileServices.registerValidation, profileController.doctorRegistration);
  app.put("/api/doctor/profile", [authJwt.verifyDoctorToken], profileController.editProfile);
  app.put("/api/doctor/clinicprofile/:id", [authJwt.verifyDoctorToken], profileController.editClinicProfileById);
  app.get("/api/doctor/profile", [authJwt.verifyDoctorToken], profileController.viewProfile);
  app.get("/api/doctor/clinicprofile", [authJwt.verifyDoctorToken], profileController.viewClinicProfile);
  app.get("/api/doctor/clinic", [authJwt.verifyDoctorToken], profileController.clinicListing);
  app.get("/api/doctor/logout", [authJwt.verifyDoctorToken], profileController.doctorLogout);
  app.post("/api/doctor/addclinic", [authJwt.verifyDoctorToken], profileServices.addClinicValidation, profileController.addClinic);
  app.post("/api/doctor/selectclinic", [authJwt.verifyDoctorToken], profileController.selectClinic);
  app.post("/api/doctor/changeclinic", [authJwt.verifyDoctorToken], profileController.editSelectedClinic);

};
