const db = require("../../../models");
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const { methods: clinicServices } = require("../../../services/clinic");
const commonResponse = require("./common.response");
const moment = require("moment");
const Op = db.Sequelize.Op;




const OralScreeningReports = db.oral_screening_reports;


// view all screening reports (Requested, QA & QA Assigned)
exports.viewAllOralScreeningRequest = async (req, res) => {

  try {
    const oralDoctorId = req.user.oral_doctors.id
    const { page, size, s } = req.query;

    const responseData = await clinicServices.viewAllMyScreeningRequest({ oralDoctorId, page, size, s })

    const modifyRes = commonResponse.modifyRes(responseData)
    return res.status(200).json({
      success: "true",
      message: message.GET_DATA("Oral screening request"),
      data: {
        totalItems: responseData.totalItems,
        data: modifyRes,
        totalPages: responseData.totalPages,
        currentPage: responseData.currentPage
      }
    })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view All my Oral request by status (QA & QA Assigned)
exports.viewAllQaQAassignedRequest = async (req, res) => {

  try {
    const oralDoctorId = req.user.oral_doctors.id
    const { status, page, size, s } = req.query;

    const responseData = await clinicServices.viewAllMyScreeningRequest({ oralDoctorId, status, page, size, s })

    const modifyRes = commonResponse.modifyRes(responseData)
    return res.status(200).json({
      success: "true",
      message: message.GET_DATA("Oral screening request"),
      data: {
        totalItems: responseData.totalItems,
        data: modifyRes,
        totalPages: responseData.totalPages,
        currentPage: responseData.currentPage
      }
    })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view screening report detail
exports.viewScreeningReportById = async (req, res) => {

  try {
    const id = req.params.id;
    const data = await clinicServices.viewScreeningReportDetail({ id })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Oral screening report"), data: data })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view assigned doctor screening report detail
exports.viewAssignedDoctorReportDetailById = async (req, res) => {

  try {
    const id = req.params.id; // put id of report table in params
    const data = await clinicServices.viewAssignedDoctorReportDetail({ id })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Oral screening report"), data: data })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view qa assigned screening report detail
exports.viewQaAssignedReportDetailById = async (req, res) => {

  try {
    const id = req.params.id;
    const data = await clinicServices.viewQaAssignedReportDetail({ id })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Oral screening report"), data: data })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

//add oral screening report notes
exports.addOralScreeningNotes = async (req, res) => {

  try {
    const id = req.params.id; // put oral screening medias id in params
    const userId = req.user.id;
    const data = await clinicServices.addOralScreeningNotes({ id, userId, ...req.body })

    if (data == true) {
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Notes") })
    } else {
      return res.status(200).json({ success: "false", message: message.CREATE_FAILD("Notes") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};