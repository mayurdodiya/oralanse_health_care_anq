const noticeBoardController = require("../../controller/admin/notice_board/notice_board.controller.js");
const noticeBoardCommonServices = require("../../controller/admin/notice_board/common.services.js");

const multer = require('multer');
const authJwt = require("../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });



  app.post("/api/admin/noticeboard",[authJwt.verifyAdminToken], noticeBoardCommonServices.addValidation, noticeBoardController.addNotice);
  app.put("/api/admin/noticeboard/:id",[authJwt.verifyAdminToken], noticeBoardController.updateNoticeById);
  app.delete("/api/admin/noticeboard/:id",[authJwt.verifyAdminToken], noticeBoardController.deleteNoticeById);
  app.get("/api/admin/noticeboard/:id",[authJwt.verifyAdminToken], noticeBoardController.viewNoticeById);
  app.get("/api/admin/noticeboard",[authJwt.verifyAdminToken], noticeBoardController.viewAllNotice);
  
};
