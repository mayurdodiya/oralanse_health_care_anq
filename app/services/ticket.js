const db = require('../models');
const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const moment = require("moment");
const { methods: commonServices } = require("./common");
const options = require("../config/options");
const _ = require("lodash");
const commonConfig = require("../config/common.config");
const challengeService = require('../controller/enduser/patient/challenges/service')
const Op = db.Sequelize.Op;

const User = db.users;
const Ticket = db.tickets;
const TicketHistory = db.ticket_histories;

const methods = {
  createNewTicket: async (data) => {
    try {
      const obj = {
        sender_id: data.userId,
        receiver_id: data.receiver_id,
        subject: data.subject,
        message: data.message,
        status: options.ticketStatus.OPENED,
        createdBy: data.userId,
        createdBy: data.userId,
      }
      const ticketData = await commonServices.create(Ticket, obj)
      return ticketData
    } catch (error) {
      return error
    }
  },
  getAllTicket: async (data) => {
    try {
      var searchData = {};
      if (data.s) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { 'subject': { [Op.like]: `%${data.s}%` } },
            { 'status': { [Op.like]: `%${data.s}%` } },
            { 'message': { [Op.like]: `%${data.s}%` } },
          ]
        }
      }
      var dateQuery = {};
      const startDate = moment(data.sd, "DD/MM/YYYY", true).format("YYYY-MM-DD");
      const endDate = moment(data.ed, "DD/MM/YYYY", true).format("YYYY-MM-DD");
      if (data.sd && data.ed) {
        dateQuery = sequelize.where(sequelize.fn("DATE", sequelize.col("createdAt")), {
          [Op.gte]: startDate, [Op.lte]: endDate
        })
      }

      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const query = {
        where: [{ sender_id: data.userId }, searchData, dateQuery],
        attributes: ["id", "sender_id", "receiver_id", "subject", "message", "status", "createdAt", "createdBy"],
        order: [["createdAt", "DESC"]],
        include: [{ model: User, as: "createdUser", attributes: ["id", "full_name", "profile_image"] },]
      }
      const ticketRes = await commonServices.getAndCountAll(Ticket, query, limit, offset);
      const response = commonServices.getPagingData(ticketRes, data.page, limit)
      let responseData = JSON.parse(JSON.stringify(response))
      return responseData
    } catch (error) {
      return error
    }
  },
  addTicketMessage: async (data) => {
    try {
      const ticketRes = await commonServices.create(TicketHistory, {
        ticket_id: data.ticketData,
        user_id: data.userId,
        message: data.message
      })
      return ticketRes
    } catch (error) {
      return error
    }
  },
  viewTicketById: async (data) => {
    try {
      const ticketData = await commonServices.get(Ticket, {
        where: { id: data.ticketId }, attributes: ['sender_id', 'receiver_id', 'subject', 'message', 'status', 'createdAt'],
        include: [
          { model: User, as: "senderUser", attributes: ["id", "full_name", "profile_image"] },
          { model: User, as: "receiverUser", attributes: ["id", "full_name", "profile_image"] },
          {
            model: TicketHistory, as: "ticketHistory", required: false, attributes: ["ticket_id", "user_id", "message", "createdAt"],
            include: [{ model: User, as: "messageUser", attributes: ["id", "full_name", "profile_image"] },]
          }],
        order: [["ticketHistory", "createdAt", "ASC"]],
      })
      return ticketData
    } catch (error) {
      return error
    }
  },
  viewTicketHistoryById: async (data) => {
    try {
      const ticketData = await commonServices.getAll(TicketHistory, {
        where: { ticket_id: data.ticketId }, attributes: ["ticket_id", "user_id", "message", "createdAt"],
        include: [{ model: User, as: "messageUser", attributes: ["id", "full_name", "profile_image"] },],
        order: [["createdAt", "ASC"]],
      })
      return ticketData
    } catch (error) {
      return error
    }
  }
}


module.exports = { methods }