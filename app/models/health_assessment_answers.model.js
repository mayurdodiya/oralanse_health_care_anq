module.exports = (sequelize, Sequelize) => {
  const HealthAssessmentAnswers = sequelize.define("health_assessment_answers", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    health_assessment_report_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    question_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    answers: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  return HealthAssessmentAnswers;
};
