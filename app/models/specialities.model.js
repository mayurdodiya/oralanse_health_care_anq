module.exports = (sequelize, Sequelize) => {
  const Specialities = sequelize.define("specialities", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    keywords: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    alternative_name: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    parent_specialist_id: {
      type: Sequelize.INTEGER,
      defaultValue: null
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

  return Specialities;
};