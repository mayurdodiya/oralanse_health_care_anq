const db = require("../../../../models");
const { sequelize } = require("../../../../models");
const moment = require("moment");
const { methods: commonServices } = require("../../../../services/common");
const { methods: challengeService } = require("../../../../services/challenge");
const commonResponse = require("./common.response")
const serviceChallenge = require("./service")

const message = require("../../message");
const options = require('../../../../config/options');
const _ = require("lodash");
const Op = db.Sequelize.Op;

const TrackBloodSugar = db.track_blood_sugars;
const TrackBloodPressure = db.track_blood_pressures;

//add new record for blood pressure
exports.addNewBloodPressure = async (req, res) => {
  try {
    const userId = req.user.id;
    const trackBloodPressure = await commonServices.create(TrackBloodPressure, {
      user_id: userId,
      createdBy: userId,
      ...req.body
    })
    if (!trackBloodPressure) {
      return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Blood pressure") })
    }
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Blood pressure"), data: trackBloodPressure })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//add new record for blood sugar
exports.addNewBloodSugar = async (req, res) => {
  try {
    const userId = req.user.id;
    const trackBloodSugar = await commonServices.create(TrackBloodSugar, {
      user_id: userId,
      createdBy: userId,
      ...req.body
    })
    if (!trackBloodSugar) {
      return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Blood Sugar") })
    }
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Blood Sugar"), data: trackBloodSugar })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get my tracking record
exports.getTrackingRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const trackingBloodPressure = await commonServices.getAll(TrackBloodPressure, { where: { user_id: userId }, attributes: { exclude: ["type", "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt"] }, order: [["createdAt", "DESC"]] })
    const trackingBloodSugar = await commonServices.getAll(TrackBloodSugar, { where: { user_id: userId }, attributes: { exclude: ["type", "createdAt", "updatedAt", "createdBy", "updatedBy", "deletedAt"] }, order: [["createdAt", "DESC"]] })
    let tracking_record = {}
    if (trackingBloodPressure.length != 0) {
      tracking_record.bloodPressure = trackingBloodPressure[0]
    } else {
      tracking_record.bloodPressure = null
    }
    if (trackingBloodSugar.length != 0) {
      tracking_record.bloodSugar = trackingBloodSugar[0]
    } else {
      tracking_record.bloodSugar = null
    }
    if (tracking_record.bloodPressure === null && tracking_record.bloodSugar === null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Tracking"), data: null })
    } else {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Tracking"), data: tracking_record })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view blood sugar report
exports.viewBloodSugarRecord = async (req, res) => {
  try {
    const userId = req.user.id

    const { page, size, s } = req.query;

    const { limit, offset } = commonServices.getPagination(page, size);
    const query = {
      where: { user_id: userId },
      attributes: { exclude: ["updatedAt", "createdBy", "updatedBy", "deletedAt"] }
    }
    let getAllData = await commonServices.getAndCountAll(TrackBloodSugar, query, limit, offset)
    const response = commonServices.getPagingData(getAllData, page, limit);
    let responseData = JSON.parse(JSON.stringify(response))
    return res.status(200).json({ success: "true", message: message.GET_DATA("Tracking"), data: responseData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view blood pressure report
exports.viewBloodPressureRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size, s } = req.query;

    const { limit, offset } = commonServices.getPagination(page, size);
    const query = {
      where: { user_id: userId },
      attributes: { exclude: ["updatedAt", "createdBy", "updatedBy", "deletedAt"] }
    }
    let getAllData = await commonServices.getAndCountAll(TrackBloodPressure, query, limit, offset)
    const response = commonServices.getPagingData(getAllData, page, limit);
    let responseData = JSON.parse(JSON.stringify(response))

    return res.status(200).json({ success: "true", message: message.GET_DATA("Tracking"), data: responseData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
