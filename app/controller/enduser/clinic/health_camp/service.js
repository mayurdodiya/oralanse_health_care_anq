var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const message = require("../../message")

module.exports = {
    addValidation: [

    check('name').trim().notEmpty().withMessage("Name is required!").bail(),
    check('doctor_id').notEmpty().withMessage(message.VALIDATION_NECESSARY("Doctor data")).isArray().withMessage(message.VALIDATION_ISARRAY("Doctor")).bail(),
    check('description').trim().notEmpty().withMessage("Description is required!").bail(),
    check('location').trim().notEmpty().withMessage("Location is required!").bail(),
    check('start_date').trim().notEmpty().withMessage("Start date is required!").bail(),
    check('end_date').trim().notEmpty().withMessage("End date is required!").bail(),
    check('image_url').trim().notEmpty().withMessage("Image is required!").bail(),

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