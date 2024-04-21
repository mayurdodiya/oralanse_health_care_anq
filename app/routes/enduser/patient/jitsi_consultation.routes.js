const jitsiConsultationController = require("../../../controller/enduser/patient/jitsiConsultation/jitsi.controller");
const jitsiConsultationServices = require("../../../controller/enduser/patient/jitsiConsultation/service");

const multer = require('multer');
const authJwt = require("../../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.get("/api/patient/joinjitsiroom/:id", [authJwt.verifyUserToken], jitsiConsultationController.getJitsiRoomData)
  app.get("/api/patient/leavejitsiroom/:id", [authJwt.verifyUserToken], jitsiConsultationController.leaveJitsiRoom)


};
