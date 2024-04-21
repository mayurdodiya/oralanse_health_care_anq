const moment = require("moment")
const options = require("../../../../config/options")

module.exports = {
    transactionHistoryRes: (data) => {
        const obj = data.data.map(i => {
            return {
                id: i.id,
                remarks: i.remarks,
                amount: i.amount,
                createdAt: i.createdAt,
                payment_type: i.payment_type,
                status: i.status
            }
        })
        return obj
    },


    withdrawHistoryRes: (data) => {
        const obj = data.data.map(i => {
            return {
                id: i.id,
                remarks: i.remarks,
                amount: i.amount,
                createdAt: i.createdAt,
                payment_type: i.payment_type,
                status: i.status,
                user_bank_details: i.user_bank_details,

            }
        })
        return obj
    },
}