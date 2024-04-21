module.exports = (sequelize, Sequelize) => {
  const UserSubroles = sequelize.define("user_subroles", {
    name: {
      type: Sequelize.ENUM("doctor", "hospital", "staff", "nurse", "pharmacist", "hr", "lab", "dental_lab", "dental_clinic", "health_center", "patient"),
      allowNull: false,
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

  return UserSubroles;
};
