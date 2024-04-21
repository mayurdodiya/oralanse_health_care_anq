const coWorkingSpaceController = require("../../../controller/enduser/doctor/co_working_space/co_working_space.controller.js");
const coWorkingSpaceServices = require("../../../controller/enduser/doctor/co_working_space/service.js");
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

  app.get("/api/doctor/coworkingspace", [authJwt.verifyDoctorToken], coWorkingSpaceController.viewAllCoWorkingSpaces);
  app.get("/api/doctor/coworkingspace/:id", [authJwt.verifyDoctorToken], coWorkingSpaceController.viewCoWorkingSpaceDetailById);
  app.post("/api/doctor/coworkingspace/apply", [authJwt.verifyDoctorToken], coWorkingSpaceController.applyForCoWorkingSpace);
};
