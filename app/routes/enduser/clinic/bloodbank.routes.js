const bloodbankController = require("../../../controller/enduser/clinic/bloodbank/bloodbank.controller.js");
const bloodbankServices = require("../../../controller/enduser/clinic/bloodbank/service.js");
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

  app.get("/api/clinic/bloodbank/bloodtypes", [authJwt.verifyHospitalToken], bloodbankController.clinicAllBloodTypeListing);
  app.post("/api/clinic/bloodbank/donor", [authJwt.verifyHospitalToken], bloodbankServices.addValidation, bloodbankController.addDonor);
  app.get("/api/clinic/bloodbank", [authJwt.verifyHospitalToken], bloodbankController.addClinicBloodBank);
  app.put("/api/clinic/bloodbank/donor/:id", [authJwt.verifyHospitalToken], bloodbankController.updateDonor);
  app.delete("/api/clinic/bloodbank/donor/:id", [authJwt.verifyHospitalToken], bloodbankController.deleteDonor);
  app.get("/api/clinic/bloodbank/donor/:id", [authJwt.verifyHospitalToken], bloodbankController.viewDonorById);
  app.post("/api/clinic/bloodbank/donororrecipient", [authJwt.verifyHospitalToken], bloodbankController.viewAllDonorOrRecipient);
  app.put("/api/clinic/bloodbank/bloodstock/:id", [authJwt.verifyHospitalToken], bloodbankController.changeBloodStock);
};