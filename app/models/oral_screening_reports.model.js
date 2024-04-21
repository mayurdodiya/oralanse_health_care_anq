module.exports = (sequelize, Sequelize) => {
  const OralScreeningReports = sequelize.define("oral_screening_reports", {
    user_id: {
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
    screening_type: {
      type: Sequelize.ENUM("paid", "free"),
    },
    order_number: {
      type: Sequelize.STRING
    },
    payment_method: {
      type: Sequelize.ENUM("razorPay", "payPal")
    },
    amount: {
      type: Sequelize.FLOAT
    },
    ai_response: {
      type: Sequelize.JSON
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

  return OralScreeningReports;
};