module.exports = (sequelize, Sequelize) => {
  const LabTestPatients = sequelize.define("lab_test_patients", {
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: Sequelize.INTEGER,
    },
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    lab_test_clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    lab_test_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("pending", "accept", "completed", "decline"),
      allowNull: false,
    },
    result_value: {
      type: Sequelize.JSON,
    },
    generic_comment: {
      type: Sequelize.STRING,
    },
    report_path: {
      type: Sequelize.STRING,
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

  return LabTestPatients;
};