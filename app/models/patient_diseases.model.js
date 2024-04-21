module.exports = (sequelize, Sequelize) => {
  const PatientDiseases = sequelize.define("patient_diseases", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    disease_id: {
      type: Sequelize.INTEGER,
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

  return PatientDiseases;
};