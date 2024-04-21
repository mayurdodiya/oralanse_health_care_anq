module.exports = (sequelize, Sequelize) => {
  const ClinicTreatments = sequelize.define("clinic_treatments", {
    clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    sub_treatment_name: {
      type: Sequelize.STRING,
    },
    treatment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    treatment_fees: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    brand_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    parent_treatment_id: {
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

  return ClinicTreatments;
};