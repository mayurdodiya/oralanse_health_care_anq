module.exports = (sequelize, Sequelize) => {
  const PatientInsurances = sequelize.define("patient_insurances", {
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    policy_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    policy_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    company_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    insurance_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    max_amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    policy_doc: {
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

  return PatientInsurances;
};