const { check, validationResult } = require("express-validator");

module.exports = {

    changeRequestValidation :  [
      
      check('remarks').trim().notEmpty().withMessage("remarks is required!").bail(),
      check('status').trim().notEmpty().withMessage("status is required!").bail(),

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
  