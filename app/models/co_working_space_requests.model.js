module.exports = (sequelize, Sequelize) => {
  const CoworkingSpaceRequests = sequelize.define("co_working_space_requests", {
    co_working_space_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("pending", "accepted", "cancelled"),
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

  return CoworkingSpaceRequests;
};