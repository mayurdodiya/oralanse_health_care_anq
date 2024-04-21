var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message");
const moment = require("moment")
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
  },
  calcualteYear: (startDate, endDate) => {
    const smokingFirstTime = moment(startDate);
    const smokingLastTime = moment(endDate);
    const yearsDifference = smokingLastTime.diff(smokingFirstTime, 'years')
    return yearsDifference
  },
  faqJSON: () => {
    return [{
      id: 1,
      title: "What is the Quit Smoking Challenge?",
      description: "It's a free program supporting individuals in quitting smoking with resources and community."
    }, {
      id: 2,
      title: "How do I join?",
      description: "Sign up on our website for free access to resources and community support."
    }, {
      id: 3,
      title: "Is there a cost?",
      description: "No, it's entirely free."
    }, {
      id: 4,
      title: "How long does it last?",
      description: "Flexible duration; set your own quitting timeline."
    }, {
      id: 5,
      title: "Is professional support available?",
      description: "We recommend consulting healthcare professionals for personalized advice."
    }, {
      id: 6,
      title: "How do I track progress?",
      description: "Use our quit smoking challenge and share achievements in the community."
    }]
  },
};