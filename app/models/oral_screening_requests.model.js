module.exports = (sequelize, Sequelize) => {
  const OralScreeningRequests = sequelize.define("oral_screening_requests", {
    oral_screening_report_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    oral_doctor_id: {
      type: Sequelize.INTEGER,
    },
    qa_oral_doctor_id: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.ENUM("pending", "assigned", "qa", "qa_assigned", "completed", "cancelled"),
      defaultValue: "pending"
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    cancelledBy: {
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

  return OralScreeningRequests;
};