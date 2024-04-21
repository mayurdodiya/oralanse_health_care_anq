const withdrawRequestController = require("../../controller/admin/withdraw_request/withdraw_request.controller.js");
const withdrawRequestCommonServices = require("../../controller/admin/withdraw_request/common.services.js");
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.get("/api/admin/withdrawrequest", [authJwt.verifyAdminToken], withdrawRequestController.viewWithdrawRequestHistory);
  app.post("/api/admin/withdrawrequest/:id", [authJwt.verifyAdminToken], withdrawRequestCommonServices.changeRequestValidation, withdrawRequestController.changeRequestStatus);
};
