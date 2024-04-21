module.exports = (sequelize, Sequelize) => {
  const HealthAssessments = sequelize.define("health_assessments", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_path: {
      type: Sequelize.STRING,
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

  return HealthAssessments;
};
