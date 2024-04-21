module.exports = (sequelize, Sequelize) => {
  const ChallengeQuiz = sequelize.define("challenge_quizzes", {
    challenge_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    question_title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    question: {
      type: Sequelize.STRING,
    },
    option_type: {
      type: Sequelize.STRING,
    },
    option: {
      type: Sequelize.JSON,
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
  return ChallengeQuiz;
};
