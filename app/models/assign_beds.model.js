module.exports = (sequelize, Sequelize) => {
  const AssignBeds = sequelize.define("assign_beds", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    bed_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    discharge_date: {
      type: Sequelize.DATE,
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

  return AssignBeds;
};