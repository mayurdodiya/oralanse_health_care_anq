var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const Op = db.Sequelize.Op;
const User = db.users;
const HealthAssessmentAnswer = db.health_assessment_answers;

module.exports = {
  healthAssessmentAnswerExist: async (userId, question_id) => {
    return await commonServices.checkFlag(HealthAssessmentAnswer, { where: { user_id: userId, question_id: question_id } }).then(count => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  calculateAssesmentScore: (assessmentRes) => {
    let sum = 0;
    console.log(assessmentRes, "assessmentRes")
    assessmentRes.forEach((item) => {
      const answer = item.answers[0];
      const assessment = item.healthAssessment;

      const score = assessment.score.find((s) =>
        s.option === answer);

      if (score) {
        sum += score.score;
      }
    });
    return sum;
  },
  getScoreInterpretation: (sum, interpretationMap) => {
    for (const [range, message] of interpretationMap.entries()) {
      const [min, max] = range;
      if (sum >= min && sum <= max) {
        return message;
      }
    }
    return "Unknown interpretation";
  },
  getIntepretationMapArray: (assessmentTitle) => {
    let interpretationMap
    if (assessmentTitle == "Know Your Child's Smile") {
      interpretationMap = new Map([
        [[0, 5], "Excellent oral health; continue good habits."],
        [[6, 10], "Good oral health; some areas for improvement."],
        [[11, 15], "Moderate risk; consider professional dental consultation."],
        [[16, 18], "High risk; immediate dental care needed."],
      ]);
    }
    if (assessmentTitle == "How Will My Teeth Look After 10 Years") {
      interpretationMap = new Map([
        [[0, 3], "Teeth likely to remain healthy; continue good habits"],
        [[4, 6], "Some risk factors; address to ensure healthy teeth in 10 years."],
        [[7, 9], "Moderate risk; professional dental consultation needed."],
        [[10, 15], "High risk; immediate dental care needed to prevent severe future problems."],
      ]);
    }
    if (assessmentTitle == "Know your teeth type") {
      interpretationMap = new Map([
        [[0, 5], "Excellent oral health; continue good habits."],
        [[6, 10], "Good oral health; some areas for improvement."],
        [[11, 15], "Moderate risk; consider professional dental consultation."],
        [[16, 18], "High risk; immediate dental care needed."],
      ]);
    }
    if (assessmentTitle == "Body Function Analyzer") {
      interpretationMap = new Map([
        [[0, 8], "Excellent overall health and satisfaction; continue maintaining healthy habits"],
        [[9, 16], "moderate health; some areas for improvement or exploration"],
        [[17, 24], "high concerns;"],
      ]);
    }
    if (assessmentTitle == "Are you Ready for Pregnancy") {
      interpretationMap = new Map([
        [[0, 8], "Your knowledge about pregnancy seems limited. We recommend visiting our Pregnancy Awareness Page to learn more about healthy pregnancy practices."],
        [[9, 16], "You have some understanding of pregnancy, but there's room for improvement. Check out our Pregnancy Awareness Page for more detailed information."],
        [[17, 24], "Excellent! You seem well-prepared for pregnancy. Keep up the good work and stay updated with our Pregnancy Awareness Page for ongoing support and guidance."],
      ]);
    }

    return interpretationMap
  }
};