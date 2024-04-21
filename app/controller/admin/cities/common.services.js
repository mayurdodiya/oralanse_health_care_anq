const { check, validationResult } = require("express-validator");


module.exports = {

    addValidation :  [
      
      check('city_name').trim().notEmpty().withMessage("City is required!").bail(),
      check('state_name').trim().notEmpty().withMessage("State is required!").bail(),
      check('country_name').trim().notEmpty().withMessage("Country is required!").bail(),

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