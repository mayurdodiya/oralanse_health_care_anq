module.exports = (sequelize, Sequelize) => {
  const PharmacyOrderDetails = sequelize.define("pharmacy_order_details", {
    pharmacy_order_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    pharmacy_id: {
      type: Sequelize.INTEGER,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("requested", "ready_to_ship", "delivered", "cancelled", "decline"),
      allowNull: false,
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
  });

  return PharmacyOrderDetails;
};