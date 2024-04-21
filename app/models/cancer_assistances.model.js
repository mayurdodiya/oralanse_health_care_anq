module.exports = (sequelize, Sequelize) => {
  const CancerAssistances = sequelize.define("cancer_assistances", {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    sub_title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_path: {
      type: Sequelize.STRING,
    },
    meta_title: {
      type: Sequelize.STRING,
    },
    meta_description: {
      type: Sequelize.TEXT,
    },
    meta_keywords: {
      type: Sequelize.STRING,
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

  return CancerAssistances;
};