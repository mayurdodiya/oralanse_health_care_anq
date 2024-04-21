module.exports = (sequelize, Sequelize) => {
  const Ambulances = sequelize.define("ambulances", {
    clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
    },
    vehicle_no: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM("basic", "advance"),
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("active", "out_of_service", "off_duty", "on_duty"),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT
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
  }, { paranoid: true });

  return Ambulances;
};