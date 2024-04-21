module.exports = (sequelize, Sequelize) => {
  const Machines = sequelize.define("machines", {
    clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    vendor_id: {
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
    amount: {
      type: Sequelize.FLOAT,
      defaultValue: 0
    },
    stock: {
      type: Sequelize.INTEGER,
      defaultValue: 0
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
    image_url: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.ENUM("malfunction", "operational", "in_repair", "broken"),
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

  return Machines;
};