const jobController = require("../../../controller/enduser/clinic/job/job.controller.js");
const jobServices = require("../../../controller/enduser/clinic/job/service.js");
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

  app.post("/api/clinic/job", [authJwt.verifyHospitalToken], jobServices.addJobValidation, jobController.addJob);
  app.put("/api/clinic/job/:id", [authJwt.verifyHospitalToken], jobController.editJob);
  app.delete("/api/clinic/job/:id", [authJwt.verifyHospitalToken], jobController.deleteJob);
  app.get("/api/clinic/clinicjob", [authJwt.verifyHospitalToken], jobController.viewClinicAllJob);
  app.get("/api/clinic/job", [authJwt.verifyHospitalToken], jobController.jobListing);
  app.post("/api/clinic/applyjob/:id", [authJwt.verifyHospitalToken], jobController.applyForJob);
  app.get("/api/clinic/job/:id", [authJwt.verifyHospitalToken], jobController.viewJobById);
  app.get("/api/clinic/job/jobapplicants/:id", [authJwt.verifyHospitalToken], jobController.jobApplicantsListingById);
  app.get("/api/clinic/job/applicantdetail/:id", [authJwt.verifyHospitalToken], jobController.ViewApplicantsDetailById);
};