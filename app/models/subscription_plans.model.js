module.exports = (sequelize, Sequelize) => {
  const SubscriptionPlan = sequelize.define("subscription_plans", {
    plan_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    plan_description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    features: {
      type: Sequelize.JSON,
    },
    plan_price: {
      type: Sequelize.FLOAT(11, 2),
      allowNull: false,
    },
    duration_months: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1
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

  return SubscriptionPlan;
};