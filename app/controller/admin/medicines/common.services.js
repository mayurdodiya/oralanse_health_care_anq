const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

    addValidation :  [
      
      check('name').trim().notEmpty().withMessage("name is required!").bail(),
      check('speciality_id').trim().notEmpty().withMessage("speciality is required!").bail(),
      check('diseases_id').trim().notEmpty().withMessage("diseases is required!").bail(),
      check('dosage').trim().notEmpty().withMessage("dosage is required!").bail(),
      check('frequency').trim().notEmpty().withMessage("frequency is required!").bail(),

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