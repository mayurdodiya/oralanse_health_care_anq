module.exports = (sequelize, Sequelize) => {
  const Blogs = sequelize.define("blogs", {
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    is_trending: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_url: {
      type: Sequelize.STRING,
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

  return Blogs;
};