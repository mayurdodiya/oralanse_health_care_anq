const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

  // validation
    addValidation :  [
      
      check('question').trim().notEmpty().withMessage("Health assessments question is required!").bail(),
      check('option_type').trim().notEmpty().withMessage("Health assessments option type is required!").bail(),
      check('options').trim().notEmpty().withMessage("Health assessments options is required!").bail(),

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