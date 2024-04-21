module.exports = (sequelize, Sequelize) => {
  const EcomAddresses = sequelize.define("ecom_addresses", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone_no: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address_line_1: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address_line_2: {
      type: Sequelize.STRING,
      allowNull: false
    },
    address_type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    pincode: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    city: {
      type: Sequelize.STRING,
      allowNull: false
    },
    state: {
      type: Sequelize.STRING,
      allowNull: false
    },
    country: {
      type: Sequelize.STRING,
      allowNull: false
    },
    notes: {
      type: Sequelize.STRING,
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
    deletedAt: {
      type: Sequelize.DATE,
    }
  }, { paranoid: true });

  return EcomAddresses;
};
