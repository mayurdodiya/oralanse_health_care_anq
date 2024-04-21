const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;



const Transactions = db.transactions;
 


// add transaction
exports.addTransaction = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { user_id: req.body.user_id } };
    const isExistingData = await commonServices.get(Transactions, query);

    if (isExistingData == null) {

      let obj = {
        user_id: req.body.user_id,
        order_id: req.body.order_id,
        createdBy: adminId
      }
      const data = await commonServices.create(Transactions, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Transactions"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Transactions") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Transactions") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// view all transaction 
exports.viewAllTransaction = async (req, res) => {

  try {
    const { page, size, s, status } = req.query;
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;

    const datadata = await contentServices.viewAllTransaction({ startDate, endDate, page, size, s, status })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Transactions"), data: datadata })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

