module.exports = (sequelize, Sequelize) => {
  const HealthAssessmentQuiz = sequelize.define("health_assessment_quizzes", {
    health_assessment_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    question: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    option_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    options: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    score: {
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
    },
    deletedAt: {
      type: Sequelize.DATE,
    }
  }, { paranoid: true });

  return HealthAssessmentQuiz;
};
