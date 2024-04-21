const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const faqService = require("./service")
const emailServices = require("../../../../services/email")
const message = require("../../message");
const options = require('../../../../config/options');
const _ = require("lodash");
const commonConfig = require("../../../../config/common.config");
const Op = db.Sequelize.Op;

const ContactUs = db.contact_us;

//get FAQ data
exports.getFAQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const faqData = faqService.faqJSON()
    return res.status(200).json({ success: "true", message: message.GET_DATA("FAQ"), data: faqData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//add contact us
exports.addContactUs = async (req, res) => {
  try {
    const userId = req.user.id;
    const contactUs = await commonServices.create(ContactUs, {
      ...req.body
    })
    // const mailObj = {
    //   from: req.body.email,
    //   to: commonConfig.nodemailer_auth_username,
    //   subject: "Oralens Contact Us Form",
    //   template: "sendOtp",
    //   context: {
    //     otp: `${randomOtp}`,
    //   }
    // };
    // emailServices.sendMail(mailObj);
    if (!contactUs) {
      return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Contact Us") })
    }

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Contact Us"), data: contactUs })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
