module.exports = (sequelize, Sequelize) => {
  const ChallengeAnswers = sequelize.define("challenge_answers", {
    challenge_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    challenge_quiz_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    answer: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
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
  return ChallengeAnswers;
};
