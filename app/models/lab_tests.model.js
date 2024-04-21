module.exports = (sequelize, Sequelize) => {
  const LabTests = sequelize.define("lab_tests", {
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sub_category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.JSON,
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

  return LabTests;
};