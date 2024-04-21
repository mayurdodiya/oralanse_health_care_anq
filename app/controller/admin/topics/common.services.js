const db = require("../../../models");
const User = db.users;
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;





module.exports = {

  addValidation: [

    check('title').trim().notEmpty().withMessage("Featured topic title is required!").bail(),
    check('subTitle').trim().notEmpty().withMessage("Featured topic sub title is required!").bail(),
    check('image_url').trim().notEmpty().withMessage("Featured topic image is required!").bail(),
    
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