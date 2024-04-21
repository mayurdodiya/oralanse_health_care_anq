const AIScreeningController = require("../../../controller/enduser/patient/AIScreening/AI_screening.controller");
const AIScreeningServices = require("../../../controller/enduser/patient/AIScreening/service");
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

  app.get("/api/user/oralscreening", [authJwt.verifyUserToken], AIScreeningController.getOralScreeningType);
  app.get("/api/user/oralscreeningquiz", [authJwt.verifyUserToken], AIScreeningController.getAiScreeningQuiz);
  app.post("/api/user/oralscreening/createorder", [authJwt.verifyUserToken], AIScreeningController.createOralScreeningPayment);
  app.post("/api/user/oralscreening/verifyorder", [authJwt.verifyUserToken], AIScreeningController.verifyScreeningPayment);
  app.post("/api/user/oralscreeningquiz", [authJwt.verifyUserToken], AIScreeningServices.submitOralQuizValidation, AIScreeningController.submitOralQuizAnswer);
  app.get("/api/user/selfiscanreports", [authJwt.verifyUserToken], AIScreeningController.getAllScreeningReport);
  app.get("/api/user/selfiscanreport/:id", [authJwt.verifyUserToken], AIScreeningController.viewScreeningReportById);
};
