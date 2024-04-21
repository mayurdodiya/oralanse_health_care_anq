var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const message = require("../../message")
const Op = db.Sequelize.Op;
const User = db.users;

module.exports = {
  requestValidation: [
    check('full_name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Full name")).bail(),
    check('age').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Age")).bail(),
    check('gender').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Gender")).bail(),
    check('phone_no').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Phone No")).isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be 10 to 15 digit!").bail(),
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
};