const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

  addValidation: [
    check('full_name').trim().notEmpty().withMessage("First name is required!").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    // check('profile_image').trim().notEmpty().withMessage("Profile Image is required!").bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),
    
    // check('address1').trim().notEmpty().withMessage("Address1 is required!").bail(),
    // check('location').trim().notEmpty().withMessage("Location is required!").bail(),


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