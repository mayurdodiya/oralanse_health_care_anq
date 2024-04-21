module.exports = (sequelize, Sequelize) => {
  const SmokingChallenge = sequelize.define("smoking_challenges", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("active", "completed"),
    },
    total_years: {
      type: Sequelize.INTEGER,
    },
    no_of_cigarettes: {
      type: Sequelize.INTEGER,
    },
    smoking_first_time: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    smoking_last_time: {
      type: Sequelize.DATEONLY,
      allowNull: false,
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
  return SmokingChallenge;
};
