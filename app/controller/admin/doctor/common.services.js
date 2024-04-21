const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;
const message = require("../message");





module.exports = {

  addValidation: [
    check('full_name').trim().notEmpty().withMessage("Full name is required!").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),

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
  approveProfileValidation: [
    check('status').trim().notEmpty().withMessage("Status is required!").bail(),
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

  emailValidationForEdit: (Id, email) => {
    return User.count({ where: [{ id: { [Op.ne]: Id } }, { email: email }] }).then((count) => {
      if (count == 0) {
        return true;  // email is unique.
      }
      return false;   //same email is available in database.
    });
  },
}