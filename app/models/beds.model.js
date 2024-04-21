module.exports = (sequelize, Sequelize) => {
  const Beds = sequelize.define("beds", {
    clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    room_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    bed_number: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("vaccant", "occupied"),
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

  return Beds;
};