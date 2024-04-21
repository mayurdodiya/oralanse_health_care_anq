const db = require("../../../models");
const { sequelize } = require("../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices, pincodeExist } = require("../../../services/common");
const { methods: contentServices } = require("../../../services/content")
const { methods: ticketService } = require("../../../services/ticket")
const commonResponse = require("./common.response");
const message = require("../message");
const config = require("../../../config/config.json");
const options = require('../../../config/options');
const moment = require("moment")
const Op = db.Sequelize.Op;

const User = db.users;
const Ticket = db.tickets;
const TicketHistory = db.ticket_histories;


// view all raised ticket
exports.viewAllTicket = async (req, res) => {
  try {
    const userId = req.user.id
    const { page, size, s, sd, ed } = req.query;
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { 'subject': { [Op.like]: `%${s}%` } },
          { 'status': { [Op.like]: `%${s}%` } },
          { 'message': { [Op.like]: `%${s}%` } },
        ]
      }
    }
    var dateQuery = {};
    const startDate = moment(sd, "DD/MM/YYYY", true).format("YYYY-MM-DD");
    const endDate = moment(ed, "DD/MM/YYYY", true).format("YYYY-MM-DD");
    if (sd && ed) {
      dateQuery = sequelize.where(sequelize.fn("DATE", sequelize.col("createdAt")), {
        [Op.gte]: startDate, [Op.lte]: endDate
      })
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    const query = {
      where: [searchData, dateQuery],
      attributes: ["id", "sender_id", "receiver_id", "subject", "message", "status", "createdAt"],
      include: [{ model: User, as: "createdUser", attributes: ["id", "full_name", "profile_image"] }],
      order: [["createdAt", "DESC"]]
    }
    const ticketRes = await commonServices.getAndCountAll(Ticket, query, limit, offset);
    const response = commonServices.getPagingData(ticketRes, page, limit)
    let responseData = JSON.parse(JSON.stringify(response))
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



//close ticket
exports.closeTicket = async (req, res) => {
  try {
    const userId = req.user.id
    const ticketId = req.params.id
    const ticketData = await commonServices.get(Ticket, { where: { id: ticketId }, attributes: ['id', 'sender_id', 'receiver_id', 'subject', 'message', 'status', 'createdAt'] })
    if (!ticketData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Ticket") })
    }
    const ticketStatus = await commonServices.update(Ticket, { where: { id: ticketData.id } }, { status: options.ticketStatus.CLOSED })
    if (ticketStatus !== 0) {
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Ticket status") })
    } else {
      return res.status(200).json({ success: "false", message: message.CHANGE_DATA_FAILED("Ticket status") })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
