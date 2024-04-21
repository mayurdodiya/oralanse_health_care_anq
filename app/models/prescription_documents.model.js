module.exports = (sequelize, Sequelize) => {
  const PrescriptionDocuments = sequelize.define("prescription_documents", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    referral_doctor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doc_name: {
      type: Sequelize.STRING,
    },
    doc_path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doc_name: {
      type: Sequelize.STRING,
    },
    referral_doctor_id: {
      type: Sequelize.INTEGER,
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

  return PrescriptionDocuments;
};