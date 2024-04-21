const db = require("../../../../models");
const { methods: contentServices } = require("../../../../services/content")
const commonResponse = require("./common.response");
const message = require("../../message");



// view all transaction 
exports.viewTransactionHistory = async (req, res) => {

  try {
    const { page, size, status } = req.query;
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;
    const userId = req.user.id;

    const data = await contentServices.viewClinicAllTransaction({ startDate, endDate, page, size, status, userId })
    const response = await commonResponse.transactionHistoryRes(data)
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


// Withdraw request listing
exports.viewWithdrawRequestHistory = async (req, res) => {
  try {
    const { page, size, status } = req.query;
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;

    const data = await contentServices.viewAllWithdrawRequest({ startDate, endDate, page, size, status })
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