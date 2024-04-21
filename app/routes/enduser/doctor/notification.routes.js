const notificationController = require("../../../controller/enduser/doctor/Notification/notification.controller");
const notificationServices = require("../../../controller/enduser/doctor/Notification/service");

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

  app.get("/api/doctor/notification", [authJwt.verifyDoctorToken], notificationController.getAllNotification)
  app.put("/api/doctor/notification/:id", [authJwt.verifyDoctorToken], notificationController.readNotification)
  app.post("/api/doctor/notificationsetting", [authJwt.verifyDoctorToken], notificationController.changeNotificationSetting)
};
