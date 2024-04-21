const { check, validationResult } = require("express-validator");

module.exports = {

  addChallengeValidation: [

    check('name').trim().notEmpty().withMessage("Name is required!").bail(),
    check('description').trim().notEmpty().withMessage("Description is required!").bail(),
    check('image_path').trim().notEmpty().withMessage("image is required!").bail(),
    check('time').trim().notEmpty().withMessage("Time is required!").bail(),
    check('credit_points').trim().notEmpty().withMessage("Credit points is required!").bail(),

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

  addChallengeQuizValidation: [

    check('challenge_id').trim().notEmpty().withMessage("Challenge id is required!").bail(),
    check('question').trim().notEmpty().withMessage("Question is required!").bail(),
    check('option_type').trim().notEmpty().withMessage("Option type is required!").bail(),
    check('option').trim().notEmpty().withMessage("Option is required!").bail(),

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