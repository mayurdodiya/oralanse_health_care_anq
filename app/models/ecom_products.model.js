module.exports = (sequelize, Sequelize) => {
  const EcomProducts = sequelize.define("ecom_products", {
    category_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    stock: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    slug: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_trending: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
    },
    is_marketing: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
    },
    marketing_duration: {
      type: Sequelize.STRING,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
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

  return EcomProducts;
};