const db = require("../../../models");
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const { methods: clinicServices } = require("../../../services/clinic");
const options = require("../../../config/options");
const commonResponse = require("./common.response");
const moment = require("moment");
const Op = db.Sequelize.Op;




const OralScreeningReports = db.oral_screening_reports;




// view all screening reports by status
exports.viewAllOralScreeningReports = async (req, res) => {

  try {
    const { status, page, size, s } = req.query;

    const responseData = await clinicServices.viewAllScreeningReports({ status, page, size, s })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Oral screening report"), data: responseData })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// share oral screening report to doctor
exports.shareOralScreeningReport = async (req, res) => {

  try {

    const adminId = req.user.id;
    const id = req.body.id;
    const getData = await commonServices.getAll(OralScreeningReports, { where: { id: id } })
    const data = await clinicServices.shareOralScreeningReport({ adminId, getData, ...req.body })
    if (data == true) {
      return res.status(200).json({ success: "true", message: message.REQUEST_SENT("Oral screening request") })
    } else {
      return res.status(200).json({ success: "true", message: message.RECHEDULE_FAILD("Oral screening request") })
    }

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
    const id = req.params.id;
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

// view qa assigned screening report detail
exports.changeScreeningReportsStatusById = async (req, res) => {

  try {
    const id = req.params.id;
    const status = req.query.status;
    await clinicServices.changeScreeningReportsStatusById({ status, id })
    return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Oral screening report") })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};