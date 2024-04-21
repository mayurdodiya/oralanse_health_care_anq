const ChallengeController = require("../../../controller/enduser/patient/challenges/challenges.controller");
const ChallengeServices = require("../../../controller/enduser/patient/challenges/service");
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

  app.get("/api/user/challenge", [authJwt.verifyUserToken], ChallengeController.getChallengeList);
  app.get("/api/user/challenge/:slug", [authJwt.verifyUserToken], ChallengeController.getChallengeById);
  app.get("/api/user/startchallenge/:slug", [authJwt.verifyUserToken], ChallengeController.startUserChallenge);
  app.get("/api/user/mychallenge", [authJwt.verifyUserToken], ChallengeController.getMyChallenges);
  app.post("/api/user/challengeanswer/:slug", [authJwt.verifyUserToken], ChallengeServices.addAnswerValidation, ChallengeController.addUserChallengeAnswer);
  app.get("/api/user/quitsmoking", [authJwt.verifyUserToken], ChallengeController.getQuitSmokingChallenge);
  app.post("/api/user/quitsmoking", [authJwt.verifyUserToken], ChallengeController.startQuitSmokingChallenge);

};
