module.exports = (sequelize, Sequelize) => {
  const UserChallenges = sequelize.define("user_challenges", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    challenge_id: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.ENUM("active", "completed"),
    },
    time: {
      type: Sequelize.INTEGER,
    },
    credit_points: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
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
    },
  },
    { paranoid: true }
  );
  return UserChallenges;
};
