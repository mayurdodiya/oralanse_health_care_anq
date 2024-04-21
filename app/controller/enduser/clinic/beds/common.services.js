const { check, validationResult } = require("express-validator");

module.exports = {

  addValidation: [

    check('room_number').trim().notEmpty().withMessage("Room number is required!").bail(),
    check('bed_number').trim().notEmpty().withMessage("Bed number is required!").bail(),

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

}