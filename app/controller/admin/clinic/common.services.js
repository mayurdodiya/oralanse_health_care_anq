const { check, validationResult } = require("express-validator");

module.exports = {

  addValidation: [
    check('full_name').trim().notEmpty().withMessage("Full name is required!").isLength({ min: 5 }).withMessage("Full name is must be in five character").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),
    
    check('identity_proof_doc_path').trim().notEmpty().withMessage("Hospital admin identity proof is required!").bail(),
    check('gender').trim().notEmpty().withMessage("Hospital admin gender is required!").bail(),
        
    check('clinic_name').trim().not().isEmpty().withMessage("Clinic Name is required!").bail(),
    check('clinic_phone_number').trim().not().isEmpty().withMessage("Clinic phone number is required!").isMobilePhone().withMessage('Invalid clinic Phone number!').isLength(10, 15).withMessage("Clinic Phone number must be ten to fifteen digit!").bail(),
    check('clinic_document_type').trim().notEmpty().withMessage("Clinic document type is required!").bail(),
    check('document_path').trim().notEmpty().withMessage("Clinic document is required!").bail(),


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