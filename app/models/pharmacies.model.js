module.exports = (sequelize, Sequelize) => {
  const Pharmacies = sequelize.define("pharmacies", {
    clinic_id: {
      type: Sequelize.INTEGER,
    },
    medicine_id: {
      type: Sequelize.INTEGER,
    },
    description: {
      type: Sequelize.TEXT,
    },
    uses: {
      type: Sequelize.TEXT,
    },
    benefits_risk: {
      type: Sequelize.TEXT,
    },
    manufacturer: {
      type: Sequelize.STRING,
    },
    quantity: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    expiry_date: {
      type: Sequelize.DATE,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
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

  return Pharmacies;
};