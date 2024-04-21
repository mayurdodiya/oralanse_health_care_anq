const researchPostController = require("../../../controller/enduser/doctor/research_post/research_post.controller.js");
const researchPostServices = require("../../../controller/enduser/doctor/research_post/common.services.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/doctor/researchpost", [authJwt.verifyDoctorToken], researchPostServices.addValidation, researchPostController.addResearchPost);
  app.put("/api/doctor/researchpost/:id", [authJwt.verifyDoctorToken], researchPostController.updateResearchPostById);
  app.delete("/api/doctor/researchpost/:id", [authJwt.verifyDoctorToken], researchPostController.deleteResearchPostById);
  app.get("/api/doctor/researchpost/:id", [authJwt.verifyDoctorToken], researchPostController.viewResearchPostById);
  app.get("/api/doctor/researchpost", [authJwt.verifyDoctorToken], researchPostController.viewAllResearchPost);
};
