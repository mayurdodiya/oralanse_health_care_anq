const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

  addValidation: [

    check('name').trim().notEmpty().withMessage("Name is required!").bail(),
    check('percentage').trim().notEmpty().withMessage("percentage name is required!").bail(),
    check('coupon_code').trim().notEmpty().withMessage("coupon_code name is required!").bail(),

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

  // updateValidation: [

  //   check('description').trim().notEmpty().withMessage("Featured topic description is required!").isLength({ max: 250 }).withMessage("Please provide a description that is no longer than 250 characters in length!").bail(),

  //   (req, res, next) => {
  //     const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  //       return `${msg}`;
  //     };
  //     const result = validationResult(req).formatWith(errorFormatter);
  //     if (!result.isEmpty()) {
  //       return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
  //     }
  //     next();
  //   }
  // ],

}