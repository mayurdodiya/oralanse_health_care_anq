module.exports = (sequelize, Sequelize) => {
  const Challenges = sequelize.define("challenges", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    image_path: {
      type: Sequelize.STRING,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false
    },
    time: {
      type: Sequelize.INTEGER,
    },
    credit_points: {
      type: Sequelize.INTEGER,
    },
    meta_title: {
      type: Sequelize.STRING,
    },
    meta_keywords: {
      type: Sequelize.STRING,
    },
    meta_description: {
      type: Sequelize.TEXT,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
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
  return Challenges;
};
