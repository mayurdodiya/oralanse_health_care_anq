module.exports = (sequelize, Sequelize) => {
  const DoctorTimings = sequelize.define("doctor_timings", {
    doctor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    day_of_week: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    session_start_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    session_end_time: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    in_clinic_appointment: {
      type: Sequelize.BOOLEAN,
    },
    consultation: {
      type: Sequelize.BOOLEAN,
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

  return DoctorTimings;
};