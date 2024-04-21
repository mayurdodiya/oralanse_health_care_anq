const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const endUserServices = require("../../services");
const emailServices = require("../../../../services/email");
const uploadService = require("../../../../services/uploadFile");
const commonResponse = require("./common.response");
const authServices = require("./service");
const commonConfig = require("../../../../config/common.config");
const message = require("../../message");
const config = require("../../../../config/config.json");
const options = require('../../../../config/options');
const moment = require("moment")
const Op = db.Sequelize.Op;

const User = db.users;
const Tickets = db.tickets;




// add raised ticket
exports.addRaisedTicket = async (req, res) => {
  try {
    const adminUser = await commonServices.get(User, { where: { role_id: 1, is_active: true } })
    const adminId = adminUser.id;
    const userId = req.user.id;
    
    const isExist = await commonServices.get(Tickets, { where: { subject: req.body.subject } })
    if (isExist != null) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Hospital ticket") })
    }
    await contentServices.addHospitalTicket({ adminId, userId, ...req.body })
    res.status(200).json({ success: "true", message: message.ADD_DATA("Hospital ticket") })
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message })
  }
};

// update raised ticket
exports.updateRaisedTicket = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const isExist = await commonServices.get(Tickets, { where: [{ subject: req.body.subject }, { id: { [Op.ne]: id } }] })
    if (isExist != null) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Hospital ticket subject") })
    }
    await contentServices.updateHospitalTicket({ userId, id, ...req.body })
    res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Hospital ticket") })
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete raised ticket
exports.deleteRaisedTicket = async (req, res) => {
  try {
    const id = req.params.id;
    await commonServices.delete(Tickets, { where: { id: id } });
    res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Hospital ticket") })
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }
};

// view raised ticket by id
exports.viewRaisedTicketById = async (req, res) => {
  try {
    const id = req.params.id;
    const userData = await commonServices.get(Tickets, { where: { id: id }, attributes: ['subject', 'message', 'status', 'createdAt'] });
    const response = JSON.parse(JSON.stringify(userData))
    res.status(200).json({ success: "true", message: message.GET_DATA("Hospital ticket"), data: response })
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }
};

// view all raised ticket
exports.viewAllRaisedTicket = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = commonServices.getPagination(page, size);
    const query = {
      where: [],
      attributes: ['subject', 'message', 'status', 'createdAt']
    }
    const data = await commonServices.getAndCountAll(Tickets, query, limit, offset);
    const response = commonServices.getPagingData(data, page, limit)
    let responseData = JSON.parse(JSON.stringify(response))
    const modifyRes = commonResponse.modifyRes(responseData)
    res.status(200).json({
      success: "true",
      message: message.GET_DATA("Hospital ticket"),
      data: {
        totalItems: responseData.totalItems,
        data: modifyRes,
        totalPages: responseData.totalPages,
        currentPage: responseData.currentPage,
      }
    })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};