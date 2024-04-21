module.exports = (sequelize, Sequelize) => {
  const Patients = sequelize.define("patients", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    unique_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    full_name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    countryCode: {
      type: Sequelize.INTEGER,
    },
    phone_no: {
      type: Sequelize.STRING,
    },
    address1: {
      type: Sequelize.STRING,
      allowNull: true
    },
    address2: {
      type: Sequelize.STRING,
      allowNull: true
    },
    pincode: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    gender: {
      type: Sequelize.STRING
    },
    age: {
      type: Sequelize.INTEGER
    },
    profile_image: {
      type: Sequelize.STRING
    },
    relationship: {
      type: Sequelize.STRING,
    },
    reward_balance: {
      type: Sequelize.FLOAT,
    },
    cash_balance: {
      type: Sequelize.FLOAT,
    },
    has_insurance: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
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

  return Patients;
};