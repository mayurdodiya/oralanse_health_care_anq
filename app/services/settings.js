const commonConfig = require("../config/common.config");
const emailServices = require("./email");
const smsService = require("./sms");
const pushNotificationService = require("./pushNotification");
const whatsAppService = require("./wa_message_helper");
const options = require("../config/options")

module.exports = {
  sendAllNotification: async (data) => {

    if (data.email) {
      if (options.activeNotifyFlag.SEND_MAIL === true) {
        const mailOptions = {
          from: commonConfig.nodemailer_auth_username,
          to: data.email,
          subject: 'Oralens Health Care',
          template: 'common', // the name of the template file i.e email.handlebars,
          context: data.context
        };
        const sendMail = emailServices.sendMail(mailOptions)
      }
    }

    if (options.activeNotifyFlag.SEND_SMS === true) {
      const sendSms = smsService.sendSMS()
    }

    if (data.payload) {

      // send for single user
      if (options.activeNotifyFlag.SEND_PUSH_NOTIFICATION === true && data.payload.status == 'user') {
        const push = await pushNotificationService.sendPushNotification(data.payload)
      }

      // send for all user
      if (data.payload.status == 'all') {
        await pushNotificationService.sendMessageToSubscribeTopic(data.payload)
      }
    }

    if (options.activeNotifyFlag.SEND_WP_MSG === true) {
      const sendWhatsAppMSg = await whatsAppService.sendMessage()
    }

  }
}

// for email -----------------------
// const emailTmplateServices = require("../../../services/email_template")
// const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
// await sendAllNotification.sendAllNotification({ email: req.body.email, context })

// for push notification -----------
// const sendAllNotification = require("../../../services/settings");
// const fcmNotificationPayload = require("../../../services/fcm_notification_payload");
// const payload = fcmNotificationPayload.blogPayLoad({ userId: 363 })
// await sendAllNotification.sendAllNotification({ payload })

