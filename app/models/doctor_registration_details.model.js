module.exports = (sequelize, Sequelize) => {
  const DoctorRegistrationDetails = sequelize.define("doctor_registration_details", {
    doctor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    registration_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    registration_council_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    registration_year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    document_path: {
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

  return DoctorRegistrationDetails;
};