module.exports = (sequelize, Sequelize) => {
  const ClinicDoctorRelations = sequelize.define(
    "clinic_doctor_relations",
    {
      clinic_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    },
    { paranoid: true }
  );
  return ClinicDoctorRelations;
};
