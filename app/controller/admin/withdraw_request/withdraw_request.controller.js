const db = require("../../../models");
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const commonResponse = require("./common.response");
const Op = db.Sequelize.Op;




const Areas = db.areas;
const Cities = db.cities;
const Doctors = db.doctors;
const Transactions = db.transactions;
const UserBankDetails = db.user_bank_details;


// Withdraw request listing
exports.viewWithdrawRequestHistory = async (req, res) => {
  try {
    const { page, size, status, start_date, end_date } = req.query;
    // const start_date = req.body.start_date;
    // const start_date = req.body.end_date;
    console.log(page, size, status, start_date, end_date, "---------------------------------------------");
    // return
    const data = await contentServices.viewAllWithdrawRequest({ start_date, end_date, page, size, status })
    // console.log(data, "---datadatadatadat-----------------");
    // if (data.length != null) {
    const response = await commonResponse.withdrawHistoryRes(data)
    const dataObj = {
      totalItems: data.totalItems,
      data: response,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Withdraw"), data: dataObj })
    // } else {
    //   return res.status(200).json({ success: "false", message: message.NO_DATA("Withdraw data") })
    // }

  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message })
  }

};


// Change request status
exports.changeRequestStatus = async (req, res) => {

  try {
    const id = req.params.id;
    const status = req.body.status;

    if (status == 'rejected') {
      await commonServices.update(Transactions, { where: { id: id } }, { status: status, remarks: req.body.remarks })
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Transactions status") })
    }

    if (status == 'success') {
      const t = await db.sequelize.transaction()
      try {

        await commonServices.update(Transactions, { where: { id: id } }, { status: status, remarks: req.body.remarks }, t)
        const reqData = await commonServices.get(Transactions, { where: { id: id } })
        const amount = reqData.amount;
        const doctorUserId = reqData.user_id;

        const doctorData = await commonServices.get(Doctors, { where: { user_id: doctorUserId } })
        const balance = doctorData.wallet_balance;
        const addbalance = balance + amount;
        await commonServices.update(Doctors, { where: { user_id: doctorUserId } }, { wallet_balance: addbalance }, t)
        await t.commit()
        return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Transactions status") })

      } catch (error) {
        await t.rollback()
      }
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};