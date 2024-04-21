const db = require("../../../models");
const User = db.users;
const message = require("../message")
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

    addValidation :  [
      check('name').notEmpty().withMessage("name is required!").isArray().withMessage(message.VALIDATION_ISARRAY("Name")).bail(),
      check('category').trim().notEmpty().withMessage("Category is required!").bail(),
      check('sub_category').trim().notEmpty().withMessage("Sub category is required!").bail(),

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