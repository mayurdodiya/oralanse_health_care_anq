var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices, getUsedRate, getConsultationFee } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content");
const { methods: labTestService } = require("../../../../services/labtest");
const commonResponse = require("./common.response");
const commonConsultService = require("./service");
const message = require("../../message");
const options = require('../../../../config/options');
const { methods: ecommerceService } = require("../../../../services/ecommerce")
const commonConfig = require("../../../../config/common.config")

const Op = db.Sequelize.Op;
const User = db.users;
const LabTestClinic = db.lab_test_clinics;
const Setting = db.settings;

module.exports = {
  addBookAppointmentValidation: [
    check('appointment_type').trim().notEmpty().withMessage("Appointment type is required!").bail(),
    check('slot_timing').trim().notEmpty().withMessage("Appointment timing is required!").bail(),
    check('problem_info').trim().notEmpty().withMessage("Problem description is required!").bail(),
    (req, res, next) => {
      const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
      };
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
      }
      next();
    },
  ],
  calculateTotalPaymentAmount: async (data) => {
    try {
      const consultationFee = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.CONSULT_FEE } })
      const consultationAmount = parseFloat(consultationFee.value);
      const clinicLabTest = await commonServices.getAll(LabTestClinic, { where: { clinic_id: data.clinicId, lab_test_id: data.labtestId } })
      const jsonLabTest = JSON.parse(JSON.stringify(clinicLabTest))
      const labtestPriceArray = jsonLabTest.map(item => item.price)
      const totalTestPrice = labtestPriceArray.reduce((sum, num) => sum + num, 0);
      const payableAmount = consultationAmount + totalTestPrice
      const discountAmount = payableAmount * (data.discountValue / 100)
      const finalAmount = payableAmount - discountAmount
      const totalPayable = finalAmount
      return { subTotal: payableAmount, discountPrice: discountAmount, netTotal: parseFloat(totalPayable.toFixed(2)) }
    } catch (error) {
      return error
    }
  }
};