var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message")
const Op = db.Sequelize.Op;
const UserDetails = db.user_details;

module.exports = {
  
  addValidation: [
    
    check('full_name').trim().notEmpty().withMessage("Full name is required!").isLength({ min: 5 }).withMessage("Full name is must be in five character").bail(),
    check('email').trim().not().isEmpty().withMessage("Email is required!").isEmail().withMessage('Invalid email!').bail(),
    check('countryCode').trim().not().isEmpty().withMessage("Country Code is required!").bail(),
    check('phone_no').trim().not().isEmpty().withMessage("phone number is required!").isMobilePhone().withMessage('Invalid Phone number!').isLength(10, 15).withMessage("Phone number must be ten to fifteen digit!").bail(),    
    check('gender').trim().notEmpty().withMessage("Patient gender is required!").bail(),


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
  addSugarValidation: [
    
    check('appointment_id').trim().notEmpty().withMessage("appointment id is required!").bail(),
    check('patient_id').trim().not().isEmpty().withMessage("patient id is required!").bail(),
    check('date').trim().not().isEmpty().withMessage("Date is required!").bail(),
    check('time').trim().not().isEmpty().withMessage("Time is required!").bail(),    
    check('sugar').trim().notEmpty().withMessage("Sugar is required!").bail(),
    check('diastolic').trim().notEmpty().withMessage("Diastolic is required!").bail(),


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

  addHreartRateValidation: [
    
    check('appointment_id').trim().notEmpty().withMessage("appointment id is required!").bail(),
    check('patient_id').trim().not().isEmpty().withMessage("patient id is required!").bail(),
    check('date').trim().not().isEmpty().withMessage("Date is required!").bail(),
    check('time').trim().not().isEmpty().withMessage("Time is required!").bail(),    
    check('bpm').trim().notEmpty().withMessage("BPM is required!").bail(),


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

  addHeightWeightValidation: [
    
    check('appointment_id').trim().notEmpty().withMessage("appointment id is required!").bail(),
    check('patient_id').trim().not().isEmpty().withMessage("patient id is required!").bail(),
    check('date').trim().not().isEmpty().withMessage("Date is required!").bail(),
    check('time').trim().not().isEmpty().withMessage("Time is required!").bail(),    
    check('height').trim().notEmpty().withMessage("Height is required!").bail(),
    check('weight').trim().notEmpty().withMessage("Weight is required!").bail(),


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

  addUrineOutputValidation: [
    
    check('appointment_id').trim().notEmpty().withMessage("appointment id is required!").bail(),
    check('patient_id').trim().not().isEmpty().withMessage("patient id is required!").bail(),
    check('date').trim().not().isEmpty().withMessage("Date is required!").bail(),
    check('time').trim().not().isEmpty().withMessage("Time is required!").bail(),    
    check('urine_output').trim().notEmpty().withMessage("urine output is required!").bail(),


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

  addBloodPressureValidation: [
    
    check('appointment_id').trim().notEmpty().withMessage("appointment id is required!").bail(),
    check('patient_id').trim().not().isEmpty().withMessage("patient id is required!").bail(),
    check('date').trim().not().isEmpty().withMessage("Date is required!").bail(),
    check('time').trim().not().isEmpty().withMessage("Time is required!").bail(),    
    check('systolic').trim().notEmpty().withMessage("Systolic is required!").bail(),
    check('diastolic').trim().notEmpty().withMessage("Diastolic is required!").bail(),


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