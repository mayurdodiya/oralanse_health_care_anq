module.exports = (sequelize, Sequelize) => {
  const Medias = sequelize.define("medias", {
    ecom_product_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    media_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_url: {
      type: Sequelize.STRING,
      allowNull: false,
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
  });

  return Medias;
};