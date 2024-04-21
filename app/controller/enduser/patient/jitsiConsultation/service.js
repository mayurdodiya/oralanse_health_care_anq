var { check, validationResult } = require('express-validator');
const db = require("../../../../models");

const Op = db.Sequelize.Op;
const User = db.users;

module.exports = {
  addBookAppointmentValidation: [
    check('appointment_type').trim().notEmpty().withMessage("Appointment type is required!").bail(),
    check('slot_timing').trim().notEmpty().withMessage("Appointment timing is required!").bail(),
    check('problem_info').trim().notEmpty().withMessage("Problem description is required!").bail(),
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