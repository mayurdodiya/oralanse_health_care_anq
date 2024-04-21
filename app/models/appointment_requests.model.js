module.exports = (sequelize, Sequelize) => {
  const AppointmentRequests = sequelize.define("appointment_requests", {
    type: {
      type: Sequelize.ENUM('opd', 'ipd'),
    },
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: Sequelize.INTEGER
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    appointment_type: {
      type: Sequelize.ENUM("video_call", "voice_call", "online_chat", "in_clinic", "at_home", "home_lab_test", "clinic_lab_test"),
      allowNull: false,
    },
    clinic_id: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.ENUM("requested", "upcoming", "in_process", "completed", "cancelled", "reschedule", "decline"),
      allowNull: false,
    },
    slot_timing: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    treatment_id: {
      type: Sequelize.INTEGER,
    },
    speciality_id: {
      type: Sequelize.INTEGER,
    },
    is_addon: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    addon_status: {
      type: Sequelize.ENUM("requested", "upcoming", "in_process", "completed", "cancelled", "reschedule", "decline"),
    },
    lab_test_id: {
      type: Sequelize.JSON
    },
    createdBy: {
      type: Sequelize.INTEGER,
    },
    updatedBy: {
      type: Sequelize.INTEGER,
    },
    cancelledBy: {
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

  return AppointmentRequests;
};