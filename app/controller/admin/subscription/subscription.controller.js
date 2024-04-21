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



const SubscriptionPlans = db.subscription_plans;




// edit subscription by id
exports.updateSubscriptionById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(SubscriptionPlans, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This subscription") });
    }

    const query = { where: [{ plan_name: req.body.plan_name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(SubscriptionPlans, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This subscription") });
    }

    const obj = {
      plan_name: req.body.plan_name,
      plan_description: req.body.plan_description,
      features: req.body.features,
      plan_price: req.body.plan_price,
      duration_months: req.body.duration_months,
      is_active: true,
      updatedBy: adminId,
    }
    let data = await commonServices.update(SubscriptionPlans, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Subscription"), });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("subscription"), });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view subscription by id
exports.viewSubscriptionById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'plan_name', 'plan_description', 'features', 'plan_price', 'duration_months', 'is_active'],
    };
    let data = await commonServices.get(SubscriptionPlans, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Subscription"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This subscription"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all subscription
exports.viewAllSubscription = async (req, res) => {

  try {

    let query = {
      where: [],
      attributes: ['id', 'plan_name', 'plan_description', 'features', 'plan_price', 'duration_months', 'is_active'],
    };

    let data = await commonServices.getAll(SubscriptionPlans, query)
    if (data) {
      let responseData = JSON.parse(JSON.stringify(data))

      return res.status(200).json({ success: "true", message: message.GET_DATA("Subscription"), data: responseData })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This subscription") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
