const oralScreeningQuizController = require("../../controller/admin/oral_screening_quiz/oral_screening_quiz.controller.js");
const oralScreeningQuizCommonServices = require("../../controller/admin/oral_screening_quiz/common.services.js");
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


  app.post("/api/admin/oralscreeningquiz",[authJwt.verifyAdminToken], oralScreeningQuizCommonServices.addValidation, oralScreeningQuizController.addOralScreeningQuiz);
  app.put("/api/admin/oralscreeningquiz/:id",[authJwt.verifyAdminToken], oralScreeningQuizController.updateOralScreeningQuizById);
  app.delete("/api/admin/oralscreeningquiz/:id",[authJwt.verifyAdminToken], oralScreeningQuizController.deleteOralScreeningQuizById);
  app.get("/api/admin/oralscreeningquiz/:id",[authJwt.verifyAdminToken], oralScreeningQuizController.viewOralScreeningQuizById);
  app.get("/api/admin/oralscreeningquiz",[authJwt.verifyAdminToken], oralScreeningQuizController.viewAllOralScreeningQuiz);  
};
