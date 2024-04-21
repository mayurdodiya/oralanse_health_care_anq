var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  addValidation: [

    check('blood_bank_id').trim().notEmpty().withMessage("Blood group is required!").bail(),
    check('full_name').trim().notEmpty().withMessage("Full name is required!").bail(),
    check('participant_type').trim().notEmpty().withMessage("Participant type is required!").bail(),

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