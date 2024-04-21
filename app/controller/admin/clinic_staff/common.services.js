const { check, validationResult } = require("express-validator");





module.exports = {

  addValidation: [
    check('full_name').trim().notEmpty().withMessage("Full name is required!").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),
    check('profile_image').trim().notEmpty().withMessage("Profile Image is required!").bail(),

    check('address1').trim().notEmpty().withMessage("Address1 is required!").bail(),
    check('area_id').trim().notEmpty().withMessage("Area is required!").bail(),
    check('city_id').trim().notEmpty().withMessage("city is required!").bail(),
    check('language_id').trim().notEmpty().withMessage("Language is required!").bail(),
    check('location').trim().notEmpty().withMessage("location is required!").bail(),
    check('latitude').trim().notEmpty().withMessage("latitude is required!").bail(),
    check('longitude').trim().notEmpty().withMessage("longitude is required!").bail(),

    check('clinic_id').trim().not().isEmpty().withMessage("Clinic Id is required!").bail(),
    check('position_name').trim().notEmpty().withMessage("Position Name is required!").bail(),
    check('duty_start_time').trim().notEmpty().withMessage("Duty start time is required!").bail(),
    check('duty_end_time').trim().notEmpty().withMessage("Duty start time is required!").bail(),
    check('present_day').trim().notEmpty().withMessage("present day is required!").bail(),

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