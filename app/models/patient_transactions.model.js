module.exports = (sequelize, Sequelize) => {
  const PatientTransactions = sequelize.define("patient_transactions", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    order_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    payment_method: {
      type: Sequelize.ENUM("razorPay", "payPal", "cash"),
      allowNull: false,
    },
    payment_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    amount: {
      type: Sequelize.FLOAT,
    },
    status: {
      type: Sequelize.ENUM("pending", "success", "failed"),
    },
    remarks: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    txn_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    patient_insurance_id: {
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

  return PatientTransactions;
};