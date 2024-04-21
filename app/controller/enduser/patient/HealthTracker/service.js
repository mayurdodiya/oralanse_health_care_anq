var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message");
const HealthAssessmentAnswer = db.health_assessment_answers;

module.exports = {
  addAnswerValidation: [
    check('question_id').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Question id")).bail(),
    check('answer').trim().notEmpty().withMessage(message.VALIDATION_NECESSARY("Answer")).bail(),
    (req, res, next) => {
      const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
        return `${msg}`;
      };
      const result = validationResult(req).formatWith(errorFormatter);
      if (!result.isEmpty()) {
        return res.status(422).json({ "success": "false", "message": result.array().join(", ") });
      }
      next();
    },
  ],
  getSavingForSmokingChallenge: (totalCigarettes, price) => {
    const daysInWeek = 7;
    const daysInMonth = 30;
    const daysInQuarter = 90;
    const daysInHalfYear = 182;
    const daysInYear = 365;
    const per_day_saving = totalCigarettes * price;
    const per_week_saving = daysInWeek * totalCigarettes * price;
    const per_month_saving = daysInMonth * totalCigarettes * price;
    const per_quater_saving = daysInQuarter * totalCigarettes * price;
    const per_halfyear_saving = daysInHalfYear * totalCigarettes * price;
    const per_year_saving = daysInYear * totalCigarettes * price;
    return { per_day_saving, per_week_saving, per_month_saving, per_quater_saving, per_halfyear_saving, per_year_saving }
  }
};