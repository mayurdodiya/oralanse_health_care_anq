const options = require("../config/options")
module.exports = (sequelize, Sequelize) => {
  const UserDetails = sequelize.define(
    "user_details",
    {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
        type: Sequelize.STRING,
        allowNull: true,
      },
      age: {
        type: Sequelize.INTEGER
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      active_profile: {
        type: Sequelize.STRING,
        defaultValue: options.PortalType.PATIENT,
        allowNull: false,
      },
      referral_code: {
        type: Sequelize.STRING,
      },
      referral_by: {
        type: Sequelize.STRING,
      },
      location: {
        type: Sequelize.STRING,
      },
      latitude: {
        type: Sequelize.FLOAT,
      },
      longitude: {
        type: Sequelize.FLOAT,
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
    },
    { paranoid: true }
  );
  return UserDetails;
};
