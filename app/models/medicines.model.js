module.exports = (sequelize, Sequelize) => {
  const Medicines = sequelize.define("medicines", {
    speciality_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    diseases_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dosage: {
      type: Sequelize.STRING,
    },
    department: {
      type: Sequelize.TEXT,
    },
    frequency: {
      type: Sequelize.STRING,
    },
    slug: {
      type: Sequelize.STRING,
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

  return Medicines;
};