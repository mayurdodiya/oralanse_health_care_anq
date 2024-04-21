const db = require("../../../models");
const message = require("../message");
const commonConfig = require("../../../config/common.config");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content")
const emailService = require("../../../services/email");
const options = require("../../../config/options");
const email = require("../../../services/email");
const sendAllNotification = require("../../../services/settings");
const Op = db.Sequelize.Op;



const Settings = db.settings;
const User = db.users;


// edit settings
exports.updateSettings = async (req, res) => {
  try {

    const adminId = req.user.id;

    if (req.body.cigarettes_price) {
      const s_key = 'cigarettes_price';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.GENERAL } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.cigarettes_price, updatedBy: adminId })
      }
    }
    if (req.body.consultation_fee) {
      const s_key = 'consultation_fee';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.GENERAL } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.consultation_fee, updatedBy: adminId })
      }
    }
    if (req.body.admin_fee) {
      const s_key = 'admin_fee';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.GENERAL } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.admin_fee, updatedBy: adminId })
      }
    }
    if (req.body.review_point) {
      const s_key = 'review_point';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.GENERAL } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.review_point, updatedBy: adminId })
      }
    }
    if (req.body.usd_rate) {
      const s_key = 'usd_rate';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.GENERAL } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.usd_rate, updatedBy: adminId })
      }
    }
    if (req.body.doctor_payout) {
      const s_key = 'doctor_payout';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.GENERAL } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.doctor_payout, updatedBy: adminId })
      }
    }

    return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Settings") });

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// active/inactive setting status
exports.changeSettingStatus = async (req, res) => {
  try {
    const id = req.params.id;

    const data = await commonServices.get(Settings, { where: { id: id } })
    const keyStatus = data.is_active;

    if (keyStatus == true) {
      const status = false
      await contentServices.changeSettingStatus(id, status);
      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Setting") });
    } else {
      const status = true
      await contentServices.changeSettingStatus(id, status);
      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Setting") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view all settings
exports.viewAllGeneralSettings = async (req, res) => {

  try {

    let query = {
      where: [{ group: options.settingGroup.GENERAL }],
      attributes: ['id', 'group', 's_key', 'value', 'is_active'],
    };

    let data = await commonServices.getAll(Settings, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("General settings"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This settings") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// edit payment gateway settings
exports.updatePaymentGatewaySettingsOld = async (req, res) => {
  try {

    const adminId = req.user.id;

    if (req.body.razorpay_test_key) {
      const s_key = 'razorpay_test_key';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.razorpay_test_key, updatedBy: adminId })
      }
    }
    if (req.body.razoypay_test_secret) {
      const s_key = 'razoypay_test_secret';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.razoypay_test_secret, updatedBy: adminId })
      }
    }
    if (req.body.razorpay_live_key) {
      const s_key = 'razorpay_live_key';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.razorpay_live_key, updatedBy: adminId })
      }
    }
    if (req.body.razoypay_live_secret) {
      const s_key = 'razoypay_live_secret';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.razoypay_live_secret, updatedBy: adminId })
      }
    }

    if (req.body.paypal_test_key) {
      const s_key = 'paypal_test_key';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.paypal_test_key, updatedBy: adminId })
      }
    }
    if (req.body.paypal_test_secret) {
      const s_key = 'paypal_test_secret';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.paypal_test_secret, updatedBy: adminId })
      }
    }
    if (req.body.paypal_live_key) {
      const s_key = 'paypal_live_key';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.paypal_live_key, updatedBy: adminId })
      }
    }
    if (req.body.paypal_live_secret) {
      const s_key = 'paypal_live_secret';
      const data = await commonServices.get(Settings, { where: { s_key: s_key, group: options.settingGroup.PAYMENT_GATEWAY } });
      if (data) {
        await commonServices.update(Settings, { where: { s_key: s_key } }, { value: req.body.paypal_live_secret, updatedBy: adminId })
      }
    }

    return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Payment settings") });

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// edit payment gateway settings
exports.updatePaymentGatewaySettings = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id;

    const isExist = await commonServices.get(Settings, { where: [{ id: id }, { group: options.settingGroup.PAYMENT_GATEWAY }, { is_active: true }] });
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This payment settings") })
    }

    const obj = {
      value: req.body.value
    }
    const data = await commonServices.update(Settings, { where: [{ id: id }] }, obj)
    if (data != 0) {
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Payment settings") });
    } else {
      return res.status(200).json({ success: "false", message: message.NOT_UPDATE("Payment settings") });
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view all payment gateway settings
exports.viewAllPaymentSettings = async (req, res) => {

  try {

    const { page, size, s } = req.query;

    let DataObj = {}
    if (s) {
      DataObj = {
        [Op.or]: [
          { s_key: { [Op.like]: `%${s}%` } },
          { group: { [Op.like]: `%${s}%` } },
        ]
      }
    }



    const { limit, offset } = commonServices.getPagination(page, size);


    const query = {
      where: [DataObj, { group: options.settingGroup.PAYMENT_GATEWAY }],
      attributes: ['id', 'group', 's_key', 'value', 'is_active'],
    };

    const response = await commonServices.getAndCountAll(Settings, query, limit, offset);
    let data = commonServices.getPagingData(response, page, limit);
    const modifyData = JSON.parse(JSON.stringify(data))

    for (let z = 0; z < modifyData.data.length; z++) {
      const sKey = modifyData.data[z].s_key;
      const nameSplit = sKey.split('_');
      const name = nameSplit[0];

      if (name === "razorpay") {
        modifyData.data[z].name = name;
      }
      if (name === "paypal") {
        modifyData.data[z].name = name;
      }

    }
    const responseData = modifyData

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Payment settings"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This settings") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all payment gateway settings
exports.viewPaymentSettingsById = async (req, res) => {

  try {
    const id = req.params.id;

    const query = {
      where: [{ id: id }, { group: options.settingGroup.PAYMENT_GATEWAY }],
      attributes: ['id', 'group', 's_key', 'value', 'is_active'],
    };

    const data = await commonServices.get(Settings, query);
    if (!data) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This payment settings") })
    }
    const modifyData = JSON.parse(JSON.stringify(data))

    const sKey = modifyData.s_key;
    const nameSplit = sKey.split('_');
    const name = nameSplit[0];

    if (name === "razorpay") {
      modifyData.name = name;
    }
    if (name === "paypal") {
      modifyData.name = name;
    }

    const responseData = modifyData

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Payment settings"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This settings") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all email templates
exports.emailTemplatesDropdown = async (req, res) => {
  try {
    const query = {
      where: { group: options.settingGroup.EMAIL },
      attributes: ['id', 'group', 's_key', 'is_active', 'value']
    }
    const data = await commonServices.getAll(Settings, query)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Email templates"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

// view all sms templates
exports.smsTemplatesDropdown = async (req, res) => {
  try {
    const query = {
      where: { group: options.settingGroup.SMS },
      attributes: ['id', 'group', 's_key', 'is_active', 'value']
    }
    const data = await commonServices.getAll(Settings, query)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Sms templates"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

// view all whatsapp templates
exports.whatsappTemplatesDropdown = async (req, res) => {
  try {
    const query = {
      where: { group: options.settingGroup.WHATSAPP },
      attributes: ['id', 'group', 's_key', 'is_active', 'value']
    }
    const data = await commonServices.getAll(Settings, query)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Whatsapp templates"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

// send all notification
exports.sendAllNotification = async (req, res) => {
  try {
    const obj = {
      value: req.body.value,
    }
    // const data = await commonServices.update(Settings, { where: [{ s_key: req.body.s_key }, { is_active: true }, { group: "email" }] }, obj)
    // const data1 = await commonServices.update(Settings, { where: [{ s_key: req.body.s_key }, { is_active: true }, { group: "sms" }] }, obj)
    const data1 = await commonServices.update(Settings, { where: [{ s_key: req.body.s_key }, { is_active: true }, { group: "whatsapp" }] }, obj)
    console.log(data1);
    if (data1[0] != 0) {
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Templates") })
    } else {
      return res.status(200).json({ success: "false", message: message.NOT_UPDATE("Templates") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

// send all notification
exports.editAllTemplates = async (req, res) => {
  try {
    const adminId = req.user.id;
    const setting = req.body.setting;

    const updateIdArr = setting.map(item => {
      return item.id
    })

    for (let j = 0; j < setting.length; j++) {
      const updateData = {
        value: setting[j].value,
        updatedBy: adminId
      }
      await commonServices.update(Settings, { where: [{ id: updateIdArr[j] }, { is_active: true }] }, updateData)
    }

    return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Templates") })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// view all payment gateway settings
exports.viewTemplatesById = async (req, res) => {

  try {
    const id = req.params.id;

    const query = {
      where: [{ id: id }, { group: { [Op.ne]: [options.settingGroup.PAYMENT_GATEWAY] } }],
      attributes: ['id', 'group', 's_key', 'is_active', 'value'],
    };

    const data = await commonServices.get(Settings, query);
    if (!data) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Template") })
    }
    const responseData = JSON.parse(JSON.stringify(data))

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Template"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This Template") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};