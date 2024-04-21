module.exports = (sequelize, Sequelize) => {
  const UserReviews = sequelize.define("user_reviews", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    doctor_id: {
      type: Sequelize.INTEGER,
    },
    clinic_id: {
      type: Sequelize.INTEGER,
    },
    rating_point: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    review: {
      type: Sequelize.STRING,
    },
    review_answer: {
      type: Sequelize.JSON,
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

  return UserReviews;
};