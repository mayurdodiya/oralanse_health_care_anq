const pharmacyController = require("../../../controller/enduser/clinic/pharmacy/pharmacy.controller.js");
const pharmacyServices = require("../../../controller/enduser/clinic/pharmacy/service.js");
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

  app.post("/api/clinic/pharmacy", [authJwt.verifyHospitalToken], pharmacyServices.addValidation, pharmacyController.addPharmacy);
  app.put("/api/clinic/pharmacy/:id", [authJwt.verifyHospitalToken], pharmacyController.updatePharmacyById);
  app.put("/api/clinic/pharmacy/stock/:id", [authJwt.verifyHospitalToken], pharmacyController.changepharmacyStock);
  app.delete("/api/clinic/pharmacy/:id", [authJwt.verifyHospitalToken], pharmacyController.deletePharmacyById);
  app.get("/api/clinic/pharmacy", [authJwt.verifyHospitalToken], pharmacyController.viewAllPharmacy);
  app.get("/api/clinic/pharmacy/order", [authJwt.verifyHospitalToken], pharmacyController.orderListing); 
  app.get("/api/clinic/pharmacy/:id", [authJwt.verifyHospitalToken], pharmacyController.viewPharmacyById);
  app.post("/api/clinic/pharmacyorderstatus/:id", [authJwt.verifyHospitalToken], pharmacyController.acceptAndDeclineOrder);
};