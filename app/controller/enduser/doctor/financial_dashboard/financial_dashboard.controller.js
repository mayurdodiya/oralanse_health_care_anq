const db = require("../../../../models");
const { methods: contentServices } = require("../../../../services/content")
const commonResponse = require("./common.response");
const message = require("../../message");
const { methods: commonServices, pincodeExist } = require('../../../../services/common');


const Doctors = db.doctors;

// view all transaction
exports.viewTransactionHistory = async (req, res) => {

  try {
    const userId = req.user.id;
    const { page, size, status, start_date, end_date } = req.query;

    const data = await contentServices.viewAllTransaction({ userId, startDate: start_date, endDate: end_date, page, size, status })
    const response = await commonResponse.transactionHistoryRes(data)
    const doctorAvailableBalance = await commonServices.get(Doctors, { where: { user_id: userId } })
    const availableBalance = doctorAvailableBalance.wallet_balance

    const dataObj = {
      totalItems: data.totalItems,
      availableBalance: availableBalance,
      data: response,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Transactions"), data: dataObj })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// Withdraw request listing
exports.viewWithdrawRequestHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size, status, start_date, end_date } = req.query;

    const data = await contentServices.viewAllWithdrawRequest({ userId, startDate: start_date, endDate: end_date, page, size, status })
    const response = await commonResponse.withdrawHistoryRes(data)
    const dataObj = {
      totalItems: data.totalItems,
      data: response,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Transactions"), data: dataObj })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// add withdrw request 
exports.addWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const t = await db.sequelize.transaction();
    try {
      await contentServices.addWithdrawRequest({ ...req.body, userId }, t)
      return res.status(200).json({ success: "true", message: message.APPOINTMENT_REQUEST_SENT("Withdraw requset"), })
    } catch (error) {
      await t.rollback();
      res.status(200).json({ success: " false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
