var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  registerValidation: [
    check('full_name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Full Name")).bail(),
    check('email').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Email")).isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Country code")).bail(),
    check('phone_no').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Phone number")).isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be 10 to 15 digit!").bail(),
    check('pincode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Pincode")).bail(),
    check('gender').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Gender")).bail(),
    check('proof_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Proof type")).bail(),
    check('identity_proof_doc_path').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Identity proof document")).bail(),

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

  addClinicValidation: [
    check('clinic_name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Clinic name")).bail(),
    check('clinic_phone_number').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Phone number")).isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be 10 to 15 digit!").bail(),
    check('pincode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Pincode")).bail(),
    check('address').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Address")).bail(),
    check('document_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Document type")).bail(),
    check('document_path').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Clinic document")).bail(),

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
  addDoctorValidation: [
    check('full_name').trim().notEmpty().withMessage("Full name is required!").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),
    check('pincode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Pincode")).bail(),    
    check('registration_number').trim().not().isEmpty().withMessage("Registration number is required!").bail(),
    check('registration_council_id').trim().notEmpty().withMessage("Registration council name is required!").bail(),
    check('registration_year').trim().notEmpty().withMessage("Registration year is required!").bail(),
    check('document_path').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Document")).bail(),

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
  ]

};