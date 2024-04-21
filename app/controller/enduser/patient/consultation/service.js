var { check, validationResult } = require('express-validator');
const db = require("../../../../models");

const Op = db.Sequelize.Op;
const User = db.users;

module.exports = {
  addBookAppointmentValidation: [
    check('appointment_type').trim().notEmpty().withMessage("Appointment type is required!").bail(),
    check('slot_timing').trim().notEmpty().withMessage("Appointment timing is required!").bail(),
    check('problem_info').trim().notEmpty().withMessage("Problem description is required!").bail(),
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
  addReview: [
    check('rating_point').trim().notEmpty().withMessage("Rating is required!").bail(),
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
  countReviewPercentage: async (reviewArr) => {
    try {
      const reviewAnsArray = reviewArr.flat()
      const questionCounts = {};
      reviewAnsArray.forEach(item => {
        const { id, title, answer } = item;
        if (!questionCounts[id]) {
          questionCounts[id] = { title, trueCount: 0, falseCount: 0 };
        }
        if (answer === true) {
          questionCounts[id].trueCount++;
        } else {
          questionCounts[id].falseCount++;
        }
      });
      const reviewPercentages = [];
      for (const id in questionCounts) {
        const { title, trueCount, falseCount } = questionCounts[id]
        const total = trueCount + falseCount;
        const truePercent = (trueCount / total) * 100;
        const falsePercent = (falseCount / total) * 100;
        reviewPercentages.push({
          id: parseInt(id),
          title,
          truePercent: parseFloat(truePercent.toFixed(2)),
          falsePercent: parseFloat(falsePercent.toFixed(2))
        });
      }
      return reviewPercentages;
    } catch (error) {
      throw error
    }
  }
};