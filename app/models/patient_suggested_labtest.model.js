module.exports = (sequelize, Sequelize) => {
  const PatientSuggestedLabtest = sequelize.define("patient_suggested_labtest", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    lab_test_id: {
      type: Sequelize.INTEGER,
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
  });

  return PatientSuggestedLabtest;
};