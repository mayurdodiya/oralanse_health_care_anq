var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const OpenAI = require("openai");
const _ = require("lodash");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message");
const options = require('../../../../config/options');

const OralScreeningQuiz = db.oral_screening_quiz;
const OralScreeningAnswer = db.oral_screening_answers;
const OralScreeningMedia = db.oral_screening_medias;
const OralScreeningReport = db.oral_screening_reports;
const openai = new OpenAI({
  key: process.env.OPENAI_API_KEY
});

module.exports = {
  submitOralQuizValidation: [

    check('answer').notEmpty().withMessage(message.VALIDATION_NECESSARY("answer")).isArray().withMessage(message.VALIDATION_ISARRAY("answer")).bail(),
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
  faqJSON: () => {
    return [{
      id: 1,
      title: "How can get an Appointment?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ornare mi augue, at porta metus efficitur ac. Aenean sed molestie orci. Quisque imperdiet erat et sapien aliquet venenatis."
    }, {
      id: 2,
      title: "How can I search for doctors near me?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ornare mi augue, at porta metus efficitur ac. Aenean sed molestie orci. Quisque imperdiet erat et sapien aliquet venenatis."
    }, {
      id: 3,
      title: "How do I reschedule or cancel an appointment?",
      description: "Log in to your account, go to your appointments, and select the appointment you want to reschedule or cancel. Follow the prompts to make the necessary changes."
    }, {
      id: 4,
      title: "What if I need urgent medical attention?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ornare mi augue, at porta metus efficitur ac. Aenean sed molestie orci. Quisque imperdiet erat et sapien aliquet venenatis."
    }, {
      id: 5,
      title: "Can I see my appointment history and medical records in the app?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ornare mi augue, at porta metus efficitur ac. Aenean sed molestie orci. Quisque imperdiet erat et sapien aliquet venenatis."
    }, {
      id: 6,
      title: "Is my personal information and health data secure on the app?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ornare mi augue, at porta metus efficitur ac. Aenean sed molestie orci. Quisque imperdiet erat et sapien aliquet venenatis."
    }, {
      id: 7,
      title: "How do I pay for my appointments?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ornare mi augue, at porta metus efficitur ac. Aenean sed molestie orci. Quisque imperdiet erat et sapien aliquet venenatis."
    }]
  },
  createScreeningOrder: async (data) => {
    try {
      const ScreeningReport = await commonServices.create(OralScreeningReport, {
        user_id: data.userId,
        patient_id: data.patientId,
        status: options.oralScreeningReportStatus.PENDING,
        screening_type: options.oralScreeningType.PAID,
        order_number: data.order_number,
        payment_method: data.payment_method,
        amount: data.amount,
        createdBy: data.userId,
        updatedBy: data.userId,
      })
      return ScreeningReport
    } catch (error) {
      return error
    }
  },
  createOralScreeningReport: async (answerModify) => {
    return new Promise((resolve, reject) => {
      let array1 = answerModify;
      const doctorAdvicePromises = array1.map(question => {
        const userResponse = `${question.question}\nUser Selected Option: ${question.answers}`;
        return openai.completions.create({
          model: "gpt-3.5-turbo-instruct",
          prompt: `As a doctor, please provide advice for someone who ${userResponse}\n`,
          temperature: 0.7,
          max_tokens: 100,
        });
      });

      const diseasesPromises = array1.map(question => {
        const userResponse = `${question.question}\nUser Selected Option: ${question.answers}`;
        return openai.completions.create({
          model: "gpt-3.5-turbo-instruct",
          prompt: `What are the possible health risks or diseases associated with ${userResponse}\n`,
          temperature: 0.7,
          max_tokens: 250,
        });
      });

      Promise.all([...doctorAdvicePromises, ...diseasesPromises])
        .then(responses => {
          var userResponses = []
          const doctorAdviceResponses = responses.slice(0, array1.length);
          const diseasesResponses = responses.slice(array1.length);

          doctorAdviceResponses.forEach((response, index) => {
            const doctorAdvice = response.choices[0].text;
            const diseasesInformation = diseasesResponses[index].choices[0].text;
            userResponses.push({
              id: array1[index].id,
              question: array1[index].question,
              selectedOption: array1[index].answers[0],
              doctorAdvice: doctorAdvice,
              diseasesInformation: diseasesInformation
            });
          });
          const modifiedArray = _.map(userResponses, (response) => {
            if (response.diseasesInformation) {
              const diseasesArray = response.diseasesInformation.split('\n')
                .filter(Boolean)
                .map((item) => {
                  const [key, value] = item.split(':');
                  const updatedKey = key.trim().replace(/^\d+\.\s/, '');
                  return { [updatedKey]: value.trim() };
                });
              return {
                ...response,
                diseasesInformation: diseasesArray
              };
            }
            return response;
          });
          resolve(modifiedArray);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

};