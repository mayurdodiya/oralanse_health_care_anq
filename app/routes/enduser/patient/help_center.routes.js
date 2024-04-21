const HelpCenterController = require("../../../controller/enduser/patient/HelpCenter/help_center.controller");
const HelpServices = require("../../../controller/enduser/patient/HelpCenter/service");
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

  app.get("/api/user/faq", [authJwt.verifyUserToken], HelpCenterController.getFAQ);
  app.get("/api/user/contactus", [authJwt.verifyUserToken], HelpCenterController.addContactUs);

};
