module.exports = (sequelize, Sequelize) => {
  const AppointmentSummaries = sequelize.define("appointment_summaries", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    recording_link: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    transcription_summary: {
      type: Sequelize.TEXT,
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

  return AppointmentSummaries;
};