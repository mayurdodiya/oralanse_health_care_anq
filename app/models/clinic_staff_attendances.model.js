module.exports = (sequelize, Sequelize) => {
  const ClinicStaffAttendances = sequelize.define("clinic_staff_attendances", {
    clinic_staff_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    check_in: {
      type: Sequelize.TIME,
    },
    check_out: {
      type: Sequelize.TIME,
    },
    is_present: {
      type: Sequelize.BOOLEAN,
    },
    check_in: {
      type: Sequelize.TIME,
    },
    check_out: {
      type: Sequelize.TIME,
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

  return ClinicStaffAttendances;
};