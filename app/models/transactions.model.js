module.exports = (sequelize, Sequelize) => {
  const Transactions = sequelize.define('transactions', {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    order_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    payment_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    payment_method: {
      type: Sequelize.ENUM("razorPay", "payPal", "cash"),
      allowNull: false
    },
    payment_type: {
      type: Sequelize.ENUM("credit", "debit"),
      allowNull: false
    },
    request_type: {
      type: Sequelize.STRING
    },
    txn_type: {
      type: Sequelize.ENUM("appointment", "consultation", "salary", "sales", "purchase", "other", "ecom", "oral_screening", "lab_report"),
      allowNull: false
    },
    coupon_code: {
      type: Sequelize.STRING,
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM("pending", "success", "failed", "rejected"),
    },
    remarks: {
      type: Sequelize.STRING,
    },
    txn_id: {
      type: Sequelize.STRING,
      allowNull: false
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
  })
  return Transactions
}