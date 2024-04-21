const userController = require("../../controller/admin/user/user.controller");
const userCommonServices = require("./../../controller/admin/user/common.services");
const authJwt = require("../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.post("/api/admin/user", [authJwt.verifyAdminToken], userCommonServices.addValidation, userController.addUser);
  app.put("/api/admin/user/:slug", [authJwt.verifyAdminToken], userController.updateUserById);
  app.put("/api/admin/userstatus/:slug", [authJwt.verifyAdminToken], userController.updateUserStatus);
  app.delete("/api/admin/patients/:slug", [authJwt.verifyAdminToken], userController.deleteUserById);
  app.get("/api/admin/user/exportexcel", [authJwt.verifyAdminToken], userController.exportUserDetailsInExcel);
  app.get("/api/admin/user", [authJwt.verifyAdminToken], userController.viewAllUserData);
  app.get("/api/admin/user/:slug", [authJwt.verifyAdminToken], userController.viewUserById);
};