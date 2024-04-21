const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const options = require("../../../config/options");
const Op = db.Sequelize.Op;

const UserBankDetails = db.user_bank_details;
const User = db.users;
const UserDetails = db.user_details;
const Transactions = db.transactions;


// view five data of withdraw request
exports.viewFinancialDashboard = async (req, res) => {
  try {

    let transactionsQuery = {
      where: [{ request_type: options.requestType.WITHDRAW }], order: [["createdAt", "DESC"]],
      attributes: ['id', 'user_id', 'remarks', 'amount', 'createdAt', 'payment_type', 'order_id', 'status'],
      include: [
        { model: UserBankDetails, as: "user_bank_details", attributes: ['bank_name', 'account_number'] },
        {
          model: User, as: "usersTransaction", attributes: ['id', 'full_name', 'email', 'profile_image', 'phone_no'],
          // include: [
          //   { model: UserDetails, as: "user_details", attributes: ['age', 'gender'] },
          // ]
        },
      ],
    };

    let query = {
      attributes: ['id', 'remarks', 'amount', 'createdAt', 'payment_type'],
      include: [
        {
          model: User, as: "usersTransaction", attributes: ['id', 'full_name', 'email', 'profile_image', 'phone_no'],
          // include: [
          //   { model: UserDetails, as: "user_details", attributes: ['age', 'gender'] },
          // ]
        },
      ],
      order: [['createdAt', 'DESC']]
    };

    let transactionData = await commonServices.getAndCountAll(Transactions, transactionsQuery,)
    let responseData = JSON.parse(JSON.stringify(transactionData))
    const response = await commonResponse.withdrawHistoryRes(responseData)
    const dataObj = response.slice(0, 5);

    let transactionDetail = await commonServices.getAll(Transactions, query);
    let responseDetail = JSON.parse(JSON.stringify(transactionDetail));
    const dataObjDetail = responseDetail.slice(0, 5);

    return res.status(200).json({
      success: "true",
      message: message.GET_DATA("Withdraw"),
      data: {
        withdrawRequest: dataObj,
        TransactionData: dataObjDetail,
      }
    })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};