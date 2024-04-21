module.exports = (sequelize, Sequelize) => {
  const MachineLogs = sequelize.define("machine_logs", {
    machine_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    purchase_date: {
      type: Sequelize.DATE,
    },
    expiry_date: {
      type: Sequelize.DATE,
    },
    next_service_date: {
      type: Sequelize.DATE,
    },
    status: {
      type: Sequelize.ENUM("malfunction", "operational", "in_repair", "broken"),
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

  return MachineLogs;
};