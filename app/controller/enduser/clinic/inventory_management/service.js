var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  addValidation: [

    check('name').trim().notEmpty().withMessage("Name is required!").bail(),
    check('description').trim().notEmpty().withMessage("Description is required!").bail(),
    check('purchase_date').trim().notEmpty().withMessage("purchase date is required!").bail(),
    check('expiry_date').trim().notEmpty().withMessage("expiry date is required!").bail(),

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
  addInventoryValidation: [

    check('name').trim().notEmpty().withMessage("Name is required!").bail(),
    check('amount').trim().notEmpty().withMessage("amount is required!").bail(),
    check('stock').trim().notEmpty().withMessage("quantity is required!").bail(),
    check('vendor_id').trim().notEmpty().withMessage("vendor is required!").bail(),
    check('expiry_date').trim().notEmpty().withMessage("expiry date is required!").bail(),

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
  addVendorValidation: [

    check('full_name').trim().notEmpty().withMessage("Name is required!").bail(),
    check('phone_no').trim().notEmpty().withMessage("phone no is required!").bail(),
    check('pincode').trim().notEmpty().withMessage("pincode is required!").bail(),

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