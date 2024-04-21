module.exports = (sequelize, Sequelize) => {
  const OralDentalChart = sequelize.define("oral_dental_chart", {
    oral_screening_report_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    chart_type: {
      type: Sequelize.ENUM('adult_chart', 'child_chart'),
    },
    dental_diseases: {
      type: Sequelize.JSON,
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    deletedAt: {
      type: Sequelize.DATE,
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
  }, { paranoid: true });

  return OralDentalChart;
};