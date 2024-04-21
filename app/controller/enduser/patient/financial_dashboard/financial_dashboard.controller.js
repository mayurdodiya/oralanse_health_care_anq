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
const Transaction = db.transactions;
const UserRewardHistories = db.user_reward_histories;
const Patients = db.patients;


// view all transaction
exports.viewAllTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size, start_date, end_date, type, s } = req.query;
    const { limit, offset } = commonServices.getPagination(page, size);


    if (type == "transaction") {

      let DataObj = {}
      if (s) {
        DataObj = {
          [Op.or]: [
            { remarks: { [Op.like]: `%${s}%` } },
          ]
        }
      }

      var query = {
        where: [DataObj, { user_id: userId }],
        attributes: ['id', 'user_id', 'remarks', 'amount', 'status', 'createdAt'],
        // include: [
        //   { model: Patients, as: "transactionPatients", attributes: ['id', 'cash_balance'] }
        // ]
      }

      if (start_date) {
        if (start_date.length != null) {
          query.where.push({ createdAt: { [Op.between]: [start_date, end_date] } })
        }
      }

      const data = await commonServices.getAndCountAll(Transaction, query, limit, offset);
      const response = commonServices.getPagingData(data, page, limit)
      const responseData = JSON.parse(JSON.stringify(response))

      const patientReward = await commonServices.get(Patients, { where: { user_id: userId } })
      const balance = patientReward.cash_balance
      responseData.totalBalance = balance;

      return res.status(200).json({ success: "true", message: message.GET_DATA("Transaction"), data: responseData })
    }

    if (type == "reward_point") {

      let DataObj = {}
      if (s) {
        DataObj = {
          [Op.or]: [
            { remarks: { [Op.like]: `%${s}%` } },
            { reward_type: { [Op.like]: `%${s}%` } },
            { status: { [Op.like]: `%${s}%` } },
          ]
        }
      }

      const query = {
        where: [DataObj, { user_id: userId }],
        attributes: ['id', 'user_id', 'reward_point', 'status', 'remarks', 'reward_type', 'createdAt'],
      }

      if (start_date) {
        if (start_date.length != null) {  
          query.where.push({ createdAt: { [Op.between]: [start_date, end_date] } })
        }
      }

      const data = await commonServices.getAndCountAll(UserRewardHistories, query, limit, offset);
      const response = commonServices.getPagingData(data, page, limit)
      const responseData = JSON.parse(JSON.stringify(response))

      const patientReward = await commonServices.get(Patients, { where: { user_id: userId } })
      const rewardPoints = patientReward.reward_balance
      responseData.totalRewards = rewardPoints;

      return res.status(200).json({ success: "true", message: message.GET_DATA("Reward"), data: responseData })
    }

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};