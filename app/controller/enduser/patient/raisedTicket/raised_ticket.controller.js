const db = require("../../../../models");
const { sequelize } = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ticketService } = require("../../../../services/ticket")
const commonResponse = require("./common.response");
const message = require("../../message");
const config = require("../../../../config/config.json");
const options = require('../../../../config/options');
const moment = require("moment")
const Op = db.Sequelize.Op;

const User = db.users;
const Ticket = db.tickets;
const TicketHistory = db.ticket_histories;

// add raised ticket
exports.raisedNewTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const adminUser = await commonServices.get(User, { where: { role_id: 1, is_active: true } })
    const adminId = adminUser.id
    const ticketExist = await commonServices.checkFlag(Ticket, { where: { sender_id: userId, receiver_id: adminId, ...req.body } })
    if (ticketExist) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Ticket") })
    }
    const raisedTicket = await ticketService.createNewTicket({ userId, receiver_id: adminId, ...req.body })
    if (!raisedTicket) {
      return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Ticket") })
    } 1
    return res.status(200).json({ success: "true", message: message.ADD_DATA("ticket"), data: raisedTicket })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};


// view all raised ticket
exports.viewAllTicket = async (req, res) => {
  try {
    const userId = req.user.id
    const { page, size, s, sd, ed } = req.query;
    const responseData = await ticketService.getAllTicket({ userId, page, size, s, sd, ed })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Ticket"), data: responseData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

//add new message in raised ticket
exports.addNewMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const ticketId = req.params.id
    const ticketData = await commonServices.get(Ticket, { where: { id: ticketId }, attributes: ['id', 'sender_id', 'receiver_id', 'subject', 'message', 'status', 'createdAt'] })
    if (!ticketData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Ticket") })
    }
    const ticketRes = await ticketService.addTicketMessage({ userId, ticketData: ticketData.id, ...req.body })
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Message"), ticketRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// view raised ticket by id
exports.viewTicketById = async (req, res) => {
  try {
    const userId = req.user.id
    const ticketId = req.params.id
    const ticketData = await ticketService.viewTicketById({ ticketId })
    let response = JSON.parse(JSON.stringify(ticketData))
    if (!response) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Ticket") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Ticket"), data: response })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// view raised ticket by id
exports.viewTicketHistoryById = async (req, res) => {
  try {
    const userId = req.user.id
    const ticketId = req.params.id
    const ticketData = await ticketService.viewTicketHistoryById({ ticketId })
    let response = JSON.parse(JSON.stringify(ticketData))
    if (!response) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Ticket") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Ticket"), data: response })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};
