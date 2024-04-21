var { check, validationResult } = require('express-validator');
const message = require("../message")

module.exports = {

  addTicketValidation: [
    check('subject').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Subject")).bail(),
    check('message').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Message")).bail(),

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