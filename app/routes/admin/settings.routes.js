const settingController = require("../../controller/admin/settings/settings.controller.js");
const settingCommonServices = require("../../controller/admin/settings/common.services.js");
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
  
  
  
  app.put("/api/admin/generalsettings", [authJwt.verifyAdminToken], settingController.updateSettings);
  app.put("/api/admin/settings/status/:id", [authJwt.verifyAdminToken], settingController.changeSettingStatus);
  app.put("/api/admin/settings/edittemplate", [authJwt.verifyAdminToken], settingController.editAllTemplates);
  app.get("/api/admin/generalsettings", [authJwt.verifyAdminToken], settingController.viewAllGeneralSettings);
  app.get("/api/admin/settings/template/:id", [authJwt.verifyAdminToken], settingController.viewTemplatesById);
  app.get("/api/admin/settings/smstemplate", [authJwt.verifyAdminToken], settingController.smsTemplatesDropdown);
  app.get("/api/admin/settings/whatsapptemplate", [authJwt.verifyAdminToken], settingController.whatsappTemplatesDropdown);
  // app.post("/api/admin/settings/sendnotification",[authJwt.verifyAdminToken], settingController.sendAllNotification);
  app.get("/api/admin/settings/emailtemplate", [authJwt.verifyAdminToken], settingController.emailTemplatesDropdown);
  app.get("/api/admin/settings/:id", [authJwt.verifyAdminToken], settingController.viewPaymentSettingsById);
  app.get("/api/admin/settings", [authJwt.verifyAdminToken], settingController.viewAllPaymentSettings);
  app.put("/api/admin/settings/:id", [authJwt.verifyAdminToken], settingController.updatePaymentGatewaySettings);
};
