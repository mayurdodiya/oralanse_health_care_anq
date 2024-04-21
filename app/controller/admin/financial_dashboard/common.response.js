const moment = require("moment");
const db = require("../../../models");
const options = require("../../../config/options");


module.exports = {
  withdrawHistoryRes: (data) => {
    const obj = data.rows.map(i => {
      return {
        id: i.id,
        user_id: i.user_id,
        remarks: i.remarks,
        amount: i.amount,
        createdAt: i.createdAt,
        payment_type: i.payment_type,
        order_id: i.order_id,
        status: i.status,
        usersTransaction: i.usersTransaction,
        user_bank_details: i.user_bank_details,
      }
    })
    return obj
  },
};