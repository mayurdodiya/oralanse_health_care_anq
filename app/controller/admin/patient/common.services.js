const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

  addValidation: [
    check('full_name').trim().notEmpty().withMessage("Full name is required!").isLength({ min: 5 }).withMessage("Full name is must be in five character").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),
    // check('profile_image').trim().notEmpty().withMessage("Profile Image is required!").bail(),

    // check('address1').trim().notEmpty().withMessage("Address1 is required!").bail(),
    // check('area_id').trim().notEmpty().withMessage("Area is required!").bail(),
    // check('city_id').trim().notEmpty().withMessage("city is required!").bail(),
    // check('language_id').trim().notEmpty().withMessage("Language is required!").bail(),
    // check('location').trim().notEmpty().withMessage("location is required!").bail(),
    // check('latitude').trim().notEmpty().withMessage("latitude is required!").bail(),
    // check('longitude').trim().notEmpty().withMessage("longitude is required!").bail(),
    
    check('gender').trim().notEmpty().withMessage("Patient gender is required!").bail(),
    // check('age').trim().not().isEmpty().withMessage("Patient Age is required!").bail(),



    // check('patient_first_name').trim().notEmpty().withMessage("Patient First Name is required!").bail(),
    // check('patient_last_name').trim().notEmpty().withMessage("Patient Last Name is required!").bail(),
    // check('patient_gender').trim().notEmpty().withMessage("Patient Gender is required!").bail(),
    // check('patient_mobile_number').trim().not().isEmpty().withMessage("patient mobile number is required!").isMobilePhone().withMessage('Invalid Phone number!').bail(),
    // check('patient_email_address').trim().not().isEmpty().withMessage("Patient Email is required!").isEmail().withMessage('Invalid email!').bail(),
    // check('patient_blood_group').trim().notEmpty().withMessage("Patient blood group is required!").bail(),


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