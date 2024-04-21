var { check, validationResult } = require('express-validator');
const db = require("../../../../models");

const Op = db.Sequelize.Op;
const User = db.users;

module.exports = {
  addMemberValidation: [
    check('email').trim().notEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('full_name').trim().notEmpty().withMessage("Full Name is required!").bail(),
    check('countryCode').trim().notEmpty().withMessage("Country code is required!").bail(),
    check('gender').trim().notEmpty().withMessage("Gender is required!").bail(),
    check('age').trim().notEmpty().withMessage("Age is required!").bail(),
    check('relationship').trim().notEmpty().withMessage("Relationship is required!").bail(),
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