module.exports = (sequelize, Sequelize) => {
  const OralScreeningMedias = sequelize.define("oral_screening_medias", {
    oral_screening_report_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    image_type: {
      type: Sequelize.ENUM('tongue_front', 'upper_left_quadrant', 'upper_right_quadrant', 'lower_right_quadrant'),
    },
    image_url: {
      type: Sequelize.STRING,
    },
    doctor_quizz: {
      type: Sequelize.JSON,
    },
    notes: {
      type: Sequelize.STRING,
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

  return OralScreeningMedias;
};