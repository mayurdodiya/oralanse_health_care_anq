module.exports = (sequelize, Sequelize) => {
  const Cities = sequelize.define("cities", {
    city_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    state_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    country_name: {
      type: Sequelize.STRING,
      allowNull: false,
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

  return Cities;
};