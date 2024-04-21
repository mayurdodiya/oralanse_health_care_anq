const pushNotificationController = require("../../controller/admin/push_notification/push_notification.controller.js");
const pushNotificationCommonServices = require("../../controller/admin/push_notification/common.services.js");
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



  app.post("/api/admin/pushnotification",[authJwt.verifyAdminToken], pushNotificationCommonServices.addValidation, pushNotificationController.addPushNotification);
  app.get("/api/admin/pushnotification",[authJwt.verifyAdminToken], pushNotificationController.viewAllPushNotification); 
};
