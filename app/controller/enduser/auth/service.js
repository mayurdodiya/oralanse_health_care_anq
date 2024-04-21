var { check, validationResult } = require('express-validator');
const db = require("../../../models");
const { methods: commonServices } = require("../../../services/common");

const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  checkSendOtp: [
    check('value').trim().notEmpty().withMessage("phone number or email is required!").bail(),
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
  checkVerifyOtp: [
    check('value').trim().notEmpty().withMessage("phone number or email is required!").bail(),
    check('otp').trim().notEmpty().withMessage("Otp is required!").isNumeric(true).withMessage("Otp must be Numeric value").isLength(6).withMessage("Otp must be six digit").bail(),
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
  registerValidation: [
    check('email').trim().notEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('full_name').trim().notEmpty().withMessage("Full Name is required!").bail(),
    check('countryCode').trim().notEmpty().withMessage("Country code is required!").bail(),
    check('phone_no').trim().notEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be 10 to 15 digit!").bail(),
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
  signinGoogleValidation: [
    check('email').trim().notEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('full_name').trim().notEmpty().withMessage("Full Name is required!").bail(),
    check('google_id').trim().notEmpty().withMessage("Google Id is required!").bail(),
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
  signinFacebookValidation: [
    check('facebook_id').trim().notEmpty().withMessage("Facebook Id is required!").bail(),
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
  languageValidation: [
    check('language_id').trim().notEmpty().withMessage("Language is required!").bail(),
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
  switchProfile: async (data) => {
    return await commonServices.update(UserDetails,
      { where: { user_id: data.userId } }, { active_profile: data.subProfile }).then(num => {
        if (num != 0) {
          return true
        }
        return false;
      })
  }
};