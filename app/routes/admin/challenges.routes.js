const challengesController = require("../../controller/admin/challenges/challenges.controller.js");
const challengesCommonServices = require("../../controller/admin/challenges/common.services.js");
const authJwt = require("../../middleware/authjwt.js");
const multer = require('multer');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/admin/challenges",[authJwt.verifyAdminToken], challengesCommonServices.addChallengeValidation, challengesController.addChallenge);
  app.put("/api/admin/challenges/:id",[authJwt.verifyAdminToken], challengesController.updateChallengeById);
  app.put("/api/admin/challengestatus/:id", [authJwt.verifyAdminToken], challengesController.updateChallengeStatus);
  app.delete("/api/admin/challenges/:id",[authJwt.verifyAdminToken], challengesController.deleteChallengeById);
  app.get("/api/admin/challenges/:id",[authJwt.verifyAdminToken], challengesController.viewChallengeById);
  app.get("/api/admin/challenges",[authJwt.verifyAdminToken], challengesController.viewAllChallenge);
  app.get("/api/admin/viewuserchallenge",[authJwt.verifyAdminToken], challengesController.viewAllUserChallenge);
  
  app.post("/api/admin/challengequiz",[authJwt.verifyAdminToken], challengesCommonServices.addChallengeQuizValidation, challengesController.addChallengeQuiz);
  app.put("/api/admin/challengequiz/:id",[authJwt.verifyAdminToken], challengesController.updateChallengeQuizById);
  app.delete("/api/admin/challengequiz/:id",[authJwt.verifyAdminToken], challengesController.deleteChallengeQuizById);
  app.get("/api/admin/challengequiz/:id",[authJwt.verifyAdminToken], challengesController.viewChallengeQuizById);
  app.get("/api/admin/challengequiz",[authJwt.verifyAdminToken], challengesController.viewAllChallengeQuiz);
};
