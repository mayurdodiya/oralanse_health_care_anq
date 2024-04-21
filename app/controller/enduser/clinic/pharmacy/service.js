var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  addValidation: [

    check('medicine_id').trim().notEmpty().withMessage("Medicine is required!").bail(),
    check('quantity').trim().notEmpty().withMessage("Quantity is required!").bail(),
    check('amount').trim().notEmpty().withMessage("Amount is required!").bail(),
    check('expiry_date').trim().notEmpty().withMessage("Expiry date is required!").bail(),
    

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