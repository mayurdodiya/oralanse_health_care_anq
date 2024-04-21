var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  registerValidation: [
    check('email').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Email")).isEmail().withMessage('Invalid email!').bail(),
    check('full_name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Full Name")).bail(),
    check('countryCode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Country code")).bail(),
    check('phone_no').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Phone number")).isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be 10 to 15 digit!").bail(),
    check('doctor_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Type of doctor")).bail(),
    // check('prefix').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor prefix")).bail(),
    check('experience').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Experience")).isNumeric().withMessage('Only numeric value allowed for experience!').bail(),
    check('consultation_fees').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Consultation fee")).bail(),
    check('education_detail').notEmpty().withMessage(message.VALIDATION_NECESSARY("Education detail")).isArray().withMessage(message.VALIDATION_ISARRAY("Education detail")).bail(),
    check('doctor_specialities').notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor speciality")).bail(),
    check('registration_number').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor registration number")).bail(),
    check('registration_council_id').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor registration council name")).bail(),
    check('registration_year').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor registration year")).bail(),
    check('document_path').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor registration document")).bail(),
    check('doctor_timing').notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor timing")).isArray().withMessage(message.VALIDATION_ISARRAY("Doctor timing")).bail(),
    check('document_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Document type")).bail(),
    check('front_side_document').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Front side document")).bail(),

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
    check('address').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Address")).bail(),
    check('clinic_pincode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Clinic pincode")).bail(),
    check('clinic_document_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Document type")).bail(),
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
  ]

};