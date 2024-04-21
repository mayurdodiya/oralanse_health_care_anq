const options = require("../config/options")
module.exports = (sequelize, Sequelize) => {
  const Tickets = sequelize.define("tickets", {
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("opened", "closed"),
      allowNull: false,
      defaultValue: options.ticketStatus.OPENED
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

  return Tickets;
};