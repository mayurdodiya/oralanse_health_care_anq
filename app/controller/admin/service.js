const db = require("../../models");
const User = db.users;
const Areas = db.areas;
const Clinics = db.clinics;
const Op = db.Sequelize.Op;
const { check, validationResult } = require("express-validator");



module.exports = {

  addValidation: [
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('password').notEmpty().withMessage("Password is required!").bail(),
    check('first_name').trim().notEmpty().withMessage("First name is required!").bail(),
    check('last_name').trim().notEmpty().withMessage("Last name is required!").bail(),
    check('country_code').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phoneno').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').bail(),
    check('profile_image').trim().notEmpty().withMessage("Profile Image is required!").bail(),
    check('address1').trim().notEmpty().withMessage("Address1 is required!").bail(),
    check('city').trim().notEmpty().withMessage("city is required!").bail(),
    check('state').trim().notEmpty().withMessage("state is required!").bail(),
    check('country').trim().notEmpty().withMessage("country is required!").bail(),
    check('gender').trim().notEmpty().withMessage("Gender is required!").bail(),
    check('experience').trim().not().isEmpty().withMessage("Experience is required!").bail(),
    check('degree').trim().notEmpty().withMessage("degree is required!").bail(),
    check('collage').trim().notEmpty().withMessage("collage is required!").bail(),
    check('year').trim().not().isEmpty().withMessage("Year is required!").bail(),
    check('doc_path').trim().notEmpty().withMessage("Doc Path is required!").bail(),
    check('registration_number').trim().not().isEmpty().withMessage("Registration Number is required!").bail(),
    check('registration_council_id').trim().notEmpty().withMessage("Registration council name is required!").bail(),
    check('registration_year').trim().not().isEmpty().withMessage("Registration Year is required!").bail(),
    check('document_path').trim().notEmpty().withMessage("Document Path is required!").bail(),
    check('document_type').trim().notEmpty().withMessage("Document Type is required!").bail(),
    check('front_side_document').trim().notEmpty().withMessage("Front side document is required!").bail(),

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

  nameValidationForEdit: (Id, email) => {
    return User.count({ where: [{ id: { [Op.ne]: Id } }, { email: email }] }).then((count) => {
      
      if (count == 0) {
        return true;  // email is unique.
      }
      return false;   //same email is available in database.
    });
  },

  emailValidationForEdit: (Id, email) => {
    return User.count({ where: [{ id: { [Op.ne]: Id } }, { email: email }] }).then((count) => {
      
      if (count == 0) {
        return true;  // email is unique.
      }
      return false;   //same email is available in database.
    });
  },

  mobileValidationForEdit: (Id, PhoneNo) => {
    return User.count({ where: [{ id: { [Op.ne]: Id } }, { phone_no: PhoneNo }] }).then((count) => {
      
      if (count == 0) {
        return true;  // PhoneNo is unique.
      }
      return false;   //same PhoneNo is available in database.
    });
  },

  emailExist: (email) => {
    return User.count({ where: { email: email } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;  //email not exist
    });
  },

  phoneExist: (phone) => {
    return User.count({ where: { phone_no: phone } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  clinicPhoneExist: (phone) => {
    return Clinics.count({ where: { clinic_phone_number: phone } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true; // phone is unique
    })
  },

  uniqueEmailUpdate: (userId, email) => {
    return User.count({ where: { email: email, id: { [Op.ne]: userId } } }).then((count) => {
      if (count != 0) {
        return false; //same email is available in database.
      }
      return true; // email is unique.
    })
  },
  uniquePhoneUpdate: (phoneNo, userId) => {
    return User.count({ where: { phone_no: phoneNo, id: { [Op.ne]: userId } } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  uniqueClinicPhoneUpdate: (clinicPhoneNumber, clinicId) => {
    return Clinics.count({ where: { clinic_phone_number: clinicPhoneNumber, id: { [Op.ne]: clinicId } } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true; // phone is unique
    })
  },
  isPincodeExist: (pincode) => {
    return Areas.count({ where: { pincode: pincode } }).then((count) => {
      if (count != 0) {
        return true; // yes available
      }
      return false; // not available
    })
  },
}