module.exports = (sequelize, Sequelize) => {
  const ClinicStaffTimings = sequelize.define("clinic_staff_timings", {
    clinic_staff_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    day_of_week: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    session_start_time: {
      type: Sequelize.TIME,
    },
    session_end_time: {
      type: Sequelize.TIME,
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

  return ClinicStaffTimings;

};