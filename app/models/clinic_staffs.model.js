module.exports = (sequelize, Sequelize) => {
  const ClinicStaffs = sequelize.define("clinic_staffs", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    clinic_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    employee_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salary: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    salary_time: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    bed_id: {
      type: Sequelize.INTEGER,
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

  return ClinicStaffs;
};