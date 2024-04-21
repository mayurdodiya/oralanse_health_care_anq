module.exports = (sequelize, Sequelize) => {
  const AppointmentDocuments = sequelize.define("appointment_documents", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    media_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    media_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    media_path: {
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

  return AppointmentDocuments;
};