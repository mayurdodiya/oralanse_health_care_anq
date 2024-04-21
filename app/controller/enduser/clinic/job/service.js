var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {

  addJobValidation: [
    check('company_name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Company name")).bail(),
    check('name').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Name")).bail(),
    check('experience').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Experience")).bail(),
    check('job_type').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Job type")).bail(),
    check('degree_id').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Degree")).bail(),
    check('location').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Location")).bail(),
    check('salary').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Salary")).bail(),
    check('salary_time').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("salary time")).bail(),
    check('speciality_id').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("speciality")).bail(),

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