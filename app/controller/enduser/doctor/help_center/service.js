var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message");
const HealthAssessmentAnswer = db.health_assessment_answers;

module.exports = {
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
  }
};