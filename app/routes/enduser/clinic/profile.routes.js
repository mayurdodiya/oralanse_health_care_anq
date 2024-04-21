const profileController = require("../../../controller/enduser/clinic/profile/profile.controller");
const profileServices = require("../../../controller/enduser/clinic/profile/service");
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

  app.get("/api/clinic/owner/profile", [authJwt.verifyUserToken], profileController.viewOwnerProfile);
  app.get("/api/clinic/profile", [authJwt.verifyUserToken], profileController.viewClinicProfile);
  app.get("/api/clinic/doctorprofile", [authJwt.verifyHospitalToken], profileController.viewAllDoctorProfile);
  app.get("/api/clinic/doctorlist", [authJwt.verifyHospitalToken], profileController.doctorDropdown);
  app.get("/api/clinic/doctorprofile/:slug", [authJwt.verifyHospitalToken], profileController.viewDoctorProfileById);
  app.post("/api/clinic/profile", [authJwt.verifyUserToken], profileServices.registerValidation, profileController.createOwnerProfile);
  app.post("/api/clinic/addclinic", [authJwt.verifyUserToken], profileServices.addClinicValidation, profileController.addClinic);;
  app.post("/api/clinic/adddoctor", [authJwt.verifyHospitalToken], profileServices.addDoctorValidation, profileController.addClinicDoctor);
  // app.get("/api/clinic/productlisting", [authJwt.verifyHospitalToken], profileController.getTrendingProductList);

  app.put("/api/clinic/editownerprofile", [authJwt.verifyHospitalToken], profileController.editOwnerProfile);
  app.put("/api/clinic/editclinicprofile", [authJwt.verifyHospitalToken], profileController.editClinicProfileById);
  app.put("/api/clinic/editdoctorprofile/:slug", [authJwt.verifyHospitalToken], profileController.editDoctorProfileById);
};
