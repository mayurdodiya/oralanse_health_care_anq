const db = require("../../../../models");
const { Sequelize } = require("../../../../models");
const moment = require("moment");
const _ = require("lodash");
const { methods: commonServices } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content");
const { methods: consultationServices, consultationExist } = require("../../../../services/consultation");
const commonResponse = require("./common.response");
const commonConsultService = require("./service");
const message = require("../../message");
const options = require('../../../../config/options');
const { methods: ecommerceService } = require("../../../../services/ecommerce")
const commonConfig = require("../../../../config/common.config")
const Op = db.Sequelize.Op;

const User = db.users;
const JitsiRoom = db.jitsi_rooms;


//get jitsi room data
exports.getJitsiRoomData = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.user.patients.id
    const appointmentId = req.params.id;
    const roomData = await commonServices.get(JitsiRoom, { where: { appointment_id: appointmentId }, attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] } })
    if (!roomData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Room data") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Room"), data: roomData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//leave jitsi room
exports.leaveJitsiRoom = async (req, res) => {
  try {
    const userId = req.user.id
    const patientId = req.user.patients.id
    const appointmentId = req.params.id;
    const roomData = await commonServices.get(JitsiRoom, { where: { appointment_id: appointmentId }, attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] } })
    if (!roomData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Room data") })
    } else {
      const startJitsi = await commonServices.update(JitsiRoom, { where: { id: roomData.id } }, { is_participant: true })
      if (startJitsi[0] == 1) {
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Room data"), data: roomData })
      } else {
        return res.status(200).json({ success: "false", message: message.CHANGE_DATA_FAILED("Room data") })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
