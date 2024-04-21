module.exports = (sequelize, Sequelize) => {
  const PatientMedicines = sequelize.define("patient_medicines", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    medicine_id: {
      type: Sequelize.INTEGER,
    },
    pharmacy_order_id: {
      type: Sequelize.INTEGER,
    },
    dose: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    duration: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    repeat: {
      type: Sequelize.ENUM("everyday", "alternate_days"),
    },
    day_time: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    taken_time: {
      type: Sequelize.ENUM("after_food", "before_food"),
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

  return PatientMedicines;
};