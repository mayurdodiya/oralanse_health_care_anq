module.exports = (sequelize, Sequelize) => {
  const TrackBloodPressure = sequelize.define("track_blood_pressures", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    systolic: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    diastolic: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    pulse: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    type: {
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

  return TrackBloodPressure;
};