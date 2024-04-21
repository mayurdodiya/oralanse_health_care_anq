module.exports = (sequelize, Sequelize) => {
  const CoworkingSpaceMedias = sequelize.define("co_working_space_medias", {
    co_working_space_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doc_path: {
      type: Sequelize.STRING,
      allowNull: false,
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

  return CoworkingSpaceMedias;
};