var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {

  addJobValidation: [
    check('lab_test_id').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Lab test name")).bail(),
    check('price').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Price")).bail(),
    
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