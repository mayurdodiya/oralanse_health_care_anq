const coWorkingSpaceController = require("../../../controller/enduser/clinic/co_working_space/co_working_space.controller.js");
const coWorkingSpaceServices = require("../../../controller/enduser/clinic/co_working_space/service.js");
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

  app.post("/api/clinic/coworkingspace", [authJwt.verifyHospitalToken], coWorkingSpaceServices.addValidation, coWorkingSpaceController.addCoWorkingSpaces);
  app.put("/api/clinic/coworkingspace/:id", [authJwt.verifyHospitalToken], coWorkingSpaceController.updateCoWorkingSpaces);
  app.delete("/api/clinic/coworkingspace/:id", [authJwt.verifyHospitalToken], coWorkingSpaceController.deleteCoWorkingSpaces);
  app.get("/api/clinic/coworkingspace", [authJwt.verifyHospitalToken], coWorkingSpaceController.viewAllCoWorkingSpaces);
  app.get("/api/clinic/coworkingspace/request/:id", [authJwt.verifyHospitalToken], coWorkingSpaceController.viewAllCoWorkingSpacesRequest);
  app.get("/api/clinic/coworkingspace/:id", [authJwt.verifyHospitalToken], coWorkingSpaceController.viewCoWorkingSpaceDetailById);
  app.get("/api/clinic/coworkingrequest/:id", [authJwt.verifyHospitalToken], coWorkingSpaceController.viewRequestDetailById);
};
