module.exports = (sequelize, Sequelize) => {
  const Faqs = sequelize.define("faqs", {
    question: {
      type: Sequelize.STRING,
    },
    answer: {
      type: Sequelize.JSON,
    },
    type: {
      type: Sequelize.ENUM('doctor', 'hospital'),
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
  return Faqs;
};
