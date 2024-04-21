const jobController = require("../../../controller/enduser/doctor/job/job.controller.js");
const jobServices = require("../../../controller/enduser/doctor/job/service.js");
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

  app.post("/api/doctor/job", [authJwt.verifyDoctorToken], jobServices.addJobValidation, jobController.addJob);
  app.put("/api/doctor/job/:id", [authJwt.verifyDoctorToken], jobController.editJob);
  app.delete("/api/doctor/job/:id", [authJwt.verifyDoctorToken], jobController.deleteJob);
  app.post("/api/doctor/applyjob/:id", [authJwt.verifyDoctorToken], jobController.applyForJob);
  app.get("/api/doctor/job", [authJwt.verifyDoctorToken], jobController.jobListing);
  app.get("/api/doctor/myjob", [authJwt.verifyDoctorToken], jobController.viewAllMyJob);
  app.get("/api/doctor/job/:id", [authJwt.verifyDoctorToken], jobController.viewJobById);
  app.get("/api/doctor/jobapplicants/:id", [authJwt.verifyDoctorToken], jobController.jobApplicantsListingById);
  app.get("/api/doctor/applicantdetail/:id", [authJwt.verifyDoctorToken], jobController.ViewApplicantsDetailById);
};
