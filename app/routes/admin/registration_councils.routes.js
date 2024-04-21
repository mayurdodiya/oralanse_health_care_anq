const registrationCouncilController = require("../../controller/admin/registration_councils/registration_councils.controller.js");
const registrationCouncilCommonServices = require("../../controller/admin/registration_councils/common.services.js");
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/registrationcouncils", [authJwt.verifyAdminToken], registrationCouncilCommonServices.addValidation, registrationCouncilController.addRegistrationCouncil);
  app.put("/api/admin/registrationcouncils/:slug", [authJwt.verifyAdminToken], registrationCouncilController.updateRegistrationCouncilById);
  app.delete("/api/admin/registrationcouncils/:slug", [authJwt.verifyAdminToken], registrationCouncilController.deleteRegistrationCouncilById);
  app.get("/api/admin/registrationcouncils/:slug", [authJwt.verifyAdminToken], registrationCouncilController.viewRegistrationCouncilById);
  app.get("/api/admin/registrationcouncils", [authJwt.verifyAdminToken], registrationCouncilController.viewAllRegistrationCouncil);

};
