module.exports = (sequelize, Sequelize) => {
  const UserRewardHistories = sequelize.define('user_reward_histories', {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    reward_point: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM("pending", "completed"),
      defaultValue: "pending"
    },
    remarks: {
      type: Sequelize.STRING,
    },
    reward_type: {
      type: Sequelize.STRING,
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
  })
  return UserRewardHistories
}