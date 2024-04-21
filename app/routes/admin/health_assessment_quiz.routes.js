const healtAssessmentQuizController = require("../../controller/admin/health_assessment_quiz/health_assessment_quiz.controller.js");
const healtAssessmentQuizCommonServices = require("../../controller/admin/health_assessment_quiz/common.services.js");
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

  
  app.post("/api/admin/healthassessmentsquiz",[authJwt.verifyAdminToken], healtAssessmentQuizCommonServices.addValidation, healtAssessmentQuizController.addHealtAssessmentQuiz);
  app.put("/api/admin/healthassessmentsquiz/:id",[authJwt.verifyAdminToken], healtAssessmentQuizController.updateHealtAssessmentQuizById);
  app.delete("/api/admin/healthassessmentsquiz/:id",[authJwt.verifyAdminToken], healtAssessmentQuizController.deleteHealtAssessmentQuizById);
  app.get("/api/admin/healthassessmentsquiz/:id",[authJwt.verifyAdminToken], healtAssessmentQuizController.viewHealtAssessmentQuizById);
  app.get("/api/admin/healthassessmentsquiz",[authJwt.verifyAdminToken], healtAssessmentQuizController.viewAllHealtAssessmentQuiz);  
};
