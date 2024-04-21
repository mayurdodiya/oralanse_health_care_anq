module.exports = (sequelize, Sequelize) => {
  const OralScreeningQuiz = sequelize.define("oral_screening_quiz", {
    question: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    option_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    options: {
      type: Sequelize.JSON,
      defaultValue: []
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

  return OralScreeningQuiz;
};