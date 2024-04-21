module.exports = (sequelize, Sequelize) => {
  const PatientBloodPressures = sequelize.define("patient_blood_pressures", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    systolic: {
      type: Sequelize.FLOAT,
    },
    diastolic: {
      type: Sequelize.FLOAT,
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

  return PatientBloodPressures;
};