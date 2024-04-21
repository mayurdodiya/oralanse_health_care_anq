module.exports = (sequelize, Sequelize) => {
  const Appointments = sequelize.define("appointments", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    appointment_type: {
      type: Sequelize.ENUM("video_call", "voice_call", "online_chat", "in_clinic", "at_home", "home_lab_test", "clinic_lab_test"),
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doctor_id: {
      type: Sequelize.INTEGER,
    },
    clinic_id: {
      type: Sequelize.INTEGER,
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
    problem_info: {
      type: Sequelize.STRING,
    },
    is_addon: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    addon_doctor_id: {
      type: Sequelize.INTEGER,
    },
    addon_status: {
      type: Sequelize.ENUM("requested", "upcoming", "in_process", "completed", "cancelled", "reschedule", "decline"),
    },
    doctor_notes: {
      type: Sequelize.TEXT,
    },
    observation: {
      type: Sequelize.TEXT,
    },
    type: {
      type: Sequelize.ENUM('opd', 'ipd'),
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

  return Appointments;
};