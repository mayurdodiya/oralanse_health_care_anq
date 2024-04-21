module.exports = (sequelize, Sequelize) => {
  const AppointmentOrder = sequelize.define("appointment_orders", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    order_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    payment_method: {
      type: Sequelize.ENUM("razorPay", "payPal", "cash"),
      allowNull: false
    },
    payment_type: {
      type: Sequelize.ENUM("credit", "debit"),
      allowNull: false
    },
    txn_type: {
      type: Sequelize.ENUM("appointment", "consultation"),
      allowNull: false
    },
    sub_total: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    discount: {
      type: Sequelize.FLOAT,
    },
    coupon_code: {
      type: Sequelize.STRING,
    },
    net_total: {
      type: Sequelize.FLOAT,
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

  return AppointmentOrder;
};
