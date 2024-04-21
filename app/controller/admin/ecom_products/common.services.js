const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;
const message = require("../message")




module.exports = {

    addValidation :  [
      
      check('category_id').trim().notEmpty().withMessage("category is required!").bail(),
      check('name').trim().notEmpty().withMessage("Name is required!").bail(),
      check('price').trim().notEmpty().withMessage("price is required!").bail(),
      check('stock').trim().notEmpty().withMessage("stock is required!").bail(),
      check('media').notEmpty().withMessage(message.VALIDATION_NECESSARY("media")).isArray().withMessage(message.VALIDATION_ISARRAY("media")).bail(),

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