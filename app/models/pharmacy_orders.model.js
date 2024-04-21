module.exports = (sequelize, Sequelize) => {
  const PharmacyOrders = sequelize.define("pharmacy_orders", {
    clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    appointment_id: {
      type: Sequelize.INTEGER,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    category_type: {
      type: Sequelize.ENUM("hospital", "patient", "doctor"),
      allowNull: false,
    },
    bed_id: {
      type: Sequelize.INTEGER,
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
      type: Sequelize.ENUM("salary", "sales", "purchase", "other", "ecom"),
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

  return PharmacyOrders;
};