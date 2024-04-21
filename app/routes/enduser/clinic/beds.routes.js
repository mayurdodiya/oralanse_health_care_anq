const bedsController = require("../../../controller/enduser/clinic/beds/beds.controller.js");
const bedsCommonServices = require("../../../controller/enduser/clinic/beds/common.services.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/clinic/beds", [authJwt.verifyHospitalToken],bedsCommonServices.addValidation, bedsController.addBeds);
  app.put("/api/clinic/beds/:id", [authJwt.verifyHospitalToken], bedsController.editBeds);
  app.delete("/api/clinic/beds/:id", [authJwt.verifyHospitalToken], bedsController.deleteBeds);
  app.get("/api/clinic/beds", [authJwt.verifyHospitalToken], bedsController.viewAllBeds);

};
