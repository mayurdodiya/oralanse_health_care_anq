const noticeBoardController = require("../../../controller/enduser/clinic/notice_board/notice_board.controller.js");
const noticeBoardCommonServices = require("../../../controller/enduser/clinic/notice_board/common.services.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


;
  app.get("/api/clinic/notice",[authJwt.verifyHospitalToken], noticeBoardController.viewAllNotice);
  
};
