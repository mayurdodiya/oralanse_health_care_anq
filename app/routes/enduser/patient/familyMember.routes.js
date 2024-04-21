const familyMemberController = require("../../../controller/enduser/patient/familyMember/familyMember.controller");
const familyMemberServices = require("../../../controller/enduser/patient/familyMember/service");
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

  app.post("/api/user/family", [authJwt.verifyUserToken], familyMemberServices.addMemberValidation, familyMemberController.addFamilyMember);
  app.get("/api/user/family", [authJwt.verifyUserToken], familyMemberController.getAllMembers);
  app.get("/api/user/family/:memberId", [authJwt.verifyUserToken], familyMemberController.viewMemberProfile);
  app.put("/api/user/family/:memberId", [authJwt.verifyUserToken], familyMemberController.editMemberProfile);
  app.delete("/api/user/family/:memberId", [authJwt.verifyUserToken], familyMemberController.deleteMember);
};
