const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const faqService = require("./service")
const emailServices = require("../../../../services/email")
const message = require("../../message");
const options = require('../../../../config/options');
const _ = require("lodash");
const commonConfig = require("../../../../config/common.config");
const Op = db.Sequelize.Op;

const Faqs = db.faqs;




//get all faq questation answer list
exports.getAllFaqQuestionAndAnswer = async (req, res) => {
  try {
    const type = 'doctor';
    const query = {
        where: [{ type: type }],
        attributes: ['id', 'question', 'answer']
    }
    const data = await commonServices.getAll(Faqs, query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Faq questation and answer"), data: data })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};