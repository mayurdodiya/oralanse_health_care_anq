const notificationController = require("../../../controller/enduser/patient/Notification/notification.controller");
const notificationServices = require("../../../controller/enduser/patient/Notification/service");

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

  app.get("/api/user/notification", [authJwt.verifyUserToken], notificationController.getAllNotification)
  app.put("/api/user/notification/:id", [authJwt.verifyUserToken], notificationController.readNotification)
  app.post("/api/user/notificationsetting", [authJwt.verifyUserToken], notificationController.changeNotificationSetting)


};
