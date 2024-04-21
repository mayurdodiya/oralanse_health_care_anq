const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const faqService = require("./service")
const emailServices = require("../../../../services/email")
const message = require("../../message");
const options = require('../../../../config/options');
const _ = require("lodash");
const commonConfig = require("../../../../config/common.config");
const Op = db.Sequelize.Op;

const Notification = db.notifications;
const NotificationSetting = db.notification_settings;




//get all notification list
exports.getAllNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const { s } = req.query
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { title: { [Op.like]: `%${s}%` } }
        ]
      }
    }
    const notification = await commonServices.getAll(Notification, { where: { user_id: userId, profile_type: options.PortalType.DOCTOR, ...searchData }, attributes: { exclude: ["updatedAt"] } })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Notification"), data: notification })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//read notification
exports.readNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notification_id = req.params.id;
    const notification = await commonServices.get(Notification,
      {
        where: { user_id: userId, profile_type: options.PortalType.DOCTOR, id: notification_id },
        attributes: { exclude: ["updatedAt"] }
      })
    if (!notification) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Notification") })
    }
    const readData = await commonServices.update(Notification, { where: { id: notification.id } }, { is_read: true })
    return res.status(200).json({ success: "true", message: message.READ_DATA("Notification") })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//change notification setting
exports.changeNotificationSetting = async (req, res) => {
  try {
    const userId = req.user.id;
    const existNotification = await commonServices.get(NotificationSetting, { where: { user_id: userId } })
    console.log(userId);

    if (existNotification) {
      await commonServices.update(NotificationSetting, { where: { user_id: userId, id: existNotification.id } }, { ...req.body })
    } else {
      await commonServices.create(NotificationSetting, { user_id: userId, ...req.body })
    }
    return res.status(200).json({ success: "true", message: message.CHANGE_DATA("The notification status") })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}