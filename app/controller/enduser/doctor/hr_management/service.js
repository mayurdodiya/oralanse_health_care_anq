var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  addValidation: [

    check('full_name').trim().notEmpty().withMessage("Full name is required!").isLength({ min: 5 }).withMessage("Full name is must be in five character").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),
    check('gender').trim().notEmpty().withMessage("Patient gender is required!").bail(),
    check('has_insurance').trim().notEmpty().withMessage("Has insurance is required!").bail(),


    (req, res, next) => {
      const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
      };
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
      }
      next();
    }
  ],
  addDoctorValidation: [

    check('full_name').trim().notEmpty().withMessage("Full name is required!").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),


    (req, res, next) => {
      const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
      };
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
      }
      next();
    }
  ],

};