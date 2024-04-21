module.exports = (sequelize, Sequelize) => {
  const HealthAssessmentReports = sequelize.define("health_assessment_reports", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    health_assessment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tips: {
      type: Sequelize.STRING,
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    treatments: {
      type: Sequelize.JSON,
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
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

  return HealthAssessmentReports;
};
