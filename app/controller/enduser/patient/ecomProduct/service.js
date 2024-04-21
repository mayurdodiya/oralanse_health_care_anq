var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const message = require("../../message");

const Op = db.Sequelize.Op;
const User = db.users;

module.exports = {
  addAddressValidation: [
    check('email').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Email")).isEmail().withMessage('Invalid email!').bail(),
    check('full_name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Full Name")).bail(),
    check('phone_no').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Phone number")).isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be 10 to 15 digit!").bail(),
    check('address_line_1').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Address")).bail(),
    check('address_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Address type")).bail(),
    check('pincode').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Pincode")).bail(),
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
  createOrderValidation: [
    check('ecom_address_id').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Address")).bail(),
    check('sub_total').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Sub Total")).isNumeric().withMessage("Sub total is numeric value!").bail(),
    check('net_total').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Net Total")).isNumeric().withMessage("Net total is numeric value!").bail(),
    check('cart_data').notEmpty().withMessage(message.VALIDATION_NECESSARY("Cart data")).isArray().withMessage(message.VALIDATION_ISARRAY("Cart data")).bail(),
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