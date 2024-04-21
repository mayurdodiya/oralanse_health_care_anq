const { check, validationResult } = require("express-validator");

module.exports = {

    addValidation :  [
      
      // check('city_id').trim().notEmpty().withMessage("City is required!").bail(),
      // check('name').trim().notEmpty().withMessage("Area name is required!").bail(),
      // check('pincode').trim().notEmpty().withMessage("Pincode is required!").bail(),

      //   (req, res, next) => {
      //     const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
      //       return `${msg}`;
      //     };
      //     const result = validationResult(req).formatWith(errorFormatter);
      //     if (!result.isEmpty()) {
      //       return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
      //     }
      //     next();
      //   }
      ],

   
}
  