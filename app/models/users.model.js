module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    countryCode: {
      type: Sequelize.INTEGER,
    },
    phone_no: {
      type: Sequelize.STRING,
    },
    profile_image: {
      type: Sequelize.STRING,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    google_id: {
      type: Sequelize.STRING,
    },
    facebook_id: {
      type: Sequelize.STRING,
    },
    firebase_uid: {
      type: Sequelize.STRING,
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
    },
    resetPasswordExpiration: {
      type: Sequelize.DATE,
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

  return User;
};