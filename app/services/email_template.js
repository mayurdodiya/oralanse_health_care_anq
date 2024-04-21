const commonConfig = require("../config/common.config");
const db = require("../models");
const { methods: commonServices, pincodeExist } = require('./common');
const emailServices = require("../services/email");
const options = require("../config/options");

const Settings = db.settings;


module.exports = {
  getEmailContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.LOGIN;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      context.value = context.value.replace('{{username}}', data.fullName).replace('{{email}}', data.email)
      return context
    }
  },
  getOtpContext: async (data) => {
    const group = options.settingGroup.EMAIL
    const sKey = options.settingKey.OTP
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      context.value = context.value.replace('{{otp}}', data.otp)
      return context
    }
  },
  getProfileApproveContext: async (data) => {
    const group = options.settingGroup.EMAIL
    const sKey = options.settingKey.PROFILEAPPROVE
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
  getOnBoardingContext: async (data) => {
    const group = options.settingGroup.EMAIL
    const sKey = options.settingKey.ONBOARDING
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      context.value = context.value.replace('{{username}}', data.username)
      return context
    }
  },
  getForgotPswdContext: async (data) => {
    const group = options.settingGroup.EMAIL
    const sKey = options.settingKey.FORGOTPWD
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      context.value = context.value.replace('{{username}}', data.fullName).replace('{{resetPwdLink}}', data.resetPwdLink)
      return context
    }
  },
  getAmbulanceRequestAcceptAndDeclineContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.AMBULANCE_REQUEST;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
  getClinicAmbulanceRequestContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.CLINIC_AMBULANCE_REQUEST;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      // context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
  getOrderGenerateContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.ORDER_SUCCESS;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      // context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
  getOrderStatusContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.ORDER_STATUS;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      // context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
  getStaffSchedulingDutyInformationContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.STAFF_SCHEDULING_DUTY;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      // context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
  getAdminOrderContext: async (data) => {
    const group = options.settingGroup.EMAIL;
    const sKey = options.settingKey.ADMIN_ORDER_NOTIFY;
    const setting = await commonServices.get(Settings, { where: { group: group, s_key: sKey, is_active: true } })
    if (setting) {
      let context = { value: setting.value };
      // context.value = context.value.replace('{{profile status}}', data.status)
      return context
    }
  },
};