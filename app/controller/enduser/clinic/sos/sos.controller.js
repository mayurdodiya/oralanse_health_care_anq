const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: clinicServices } = require("../../../../services/clinic")
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment')
const Op = db.Sequelize.Op;

const HealthCamp = db.health_camps;
const Sos = db.sos;

// add emergenct contact
exports.addEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;

    let isExist = await commonServices.get(Sos, { where: [{ user_id: userId }, { phone_no: req.body.phone_no }] });
    if (isExist) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("User") });
    }

    const data = await contentServices.addEmergencyContact({ userId, ...req.body })
    if (data) {
      res.status(200).json({ success: "true", message: message.ADD_DATA("User"), })
    } else {
      res.status(200).json({ success: "false", message: message.CREATE_FAILD("User") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// update emergenct contact
exports.updateEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const query = { where: [{ user_id: userId }, { phone_no: req.body.phone_no }, { id: { [Op.ne]: req.params.id } }] };
    let isExist = await commonServices.get(Sos, query);
    if (isExist) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone no") });
    }

    const data = await contentServices.updateEmergencyContact({ id, userId, ...req.body })
    if (data) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User"), })
    } else {
      res.status(200).json({ success: "false", message: message.UPDATE_PROFILE_FAILED("User") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// delete emergenct contact
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const id = req.params.id;

    const query = { where: { id: id } };
    let isExist = await commonServices.get(Sos, query);
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") });
    }

    const data = await commonServices.delete(Sos, { where: { id: id } })
    if (data) {
      res.status(200).json({ success: "true", message: message.DELETE_PROFILE("User"), })
    } else {
      res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("User") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// view all emergenct contact
exports.getAllSosNumber = async (req, res) => {
  try {

    const userId = req.user.id;
    const data = await contentServices.getAllSosNumber({ userId })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("User"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("User") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

