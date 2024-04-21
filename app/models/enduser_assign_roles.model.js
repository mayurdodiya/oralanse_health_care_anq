module.exports = (sequelize, Sequelize) => {
  const EnduserAssignRoles = sequelize.define(
    "enduser_assign_roles",
    {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_subrole_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
  return EnduserAssignRoles;
};
