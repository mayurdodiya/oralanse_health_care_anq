const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

     addValidation :  [
        
      check('name').trim().notEmpty().withMessage("Treatment name is required!").bail(),
      check('speciality_id').trim().notEmpty().withMessage("Speciality is required!").bail(),
      check('image_path').trim().notEmpty().withMessage("Treatment image is required!").bail(),
        
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