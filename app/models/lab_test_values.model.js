module.exports = (sequelize, Sequelize) => {
  const LabTestVlues = sequelize.define("lab_test_values", {
    lab_test_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    test_parameter_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    male_range: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    female_range: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    unit: {
      type: Sequelize.STRING,
      allowNull: false,
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

  return LabTestVlues;
};