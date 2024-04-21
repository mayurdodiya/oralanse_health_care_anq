module.exports = (sequelize, Sequelize) => {
  const CampPatients = sequelize.define("camp_patients", {
    camp_id: {
      type: Sequelize.INTEGER,
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phone_no: {
      type: Sequelize.STRING,
      allowNull: false,
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
  });

  return CampPatients;
};