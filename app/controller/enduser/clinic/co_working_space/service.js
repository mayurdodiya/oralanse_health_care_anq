var { check, validationResult } = require('express-validator');
const db = require("../../../../models");

module.exports = {
    addValidation: [

    check('name').trim().notEmpty().withMessage("name is required!").bail(),
    check('phone_no').trim().notEmpty().withMessage("phone_no is required!").bail(),
    check('rent').trim().notEmpty().withMessage("rent is required!").bail(),
    check('rent_period').trim().notEmpty().withMessage("rent period is required!").bail(),

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