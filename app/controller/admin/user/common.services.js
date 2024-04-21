const { check, validationResult } = require("express-validator");

module.exports = {

  addValidation: [
    check('full_name').trim().notEmpty().withMessage("Full name is required!").isLength({ min: 5 }).withMessage("Full name is must be in five character").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').isLowercase().bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),

    // check('address1').trim().notEmpty().withMessage("Address1 is required!").bail(),
    // check('area_id').trim().notEmpty().withMessage("Area is required!").bail(),
    // check('city_id').trim().notEmpty().withMessage("city is required!").bail(),
    // check('language_id').trim().notEmpty().withMessage("Language is required!").bail(),
    // check('location').trim().notEmpty().withMessage("location is required!").bail(),
    // check('latitude').trim().notEmpty().withMessage("latitude is required!").bail(),
    // check('longitude').trim().notEmpty().withMessage("longitude is required!").bail(),

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
  ]
}