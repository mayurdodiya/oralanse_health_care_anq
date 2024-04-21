module.exports = (sequelize, Sequelize) => {
  const DoctorEducations = sequelize.define("doctor_educations", {
    doctor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    degree_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    college_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doc_path: {
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

  return DoctorEducations;
};