module.exports = (sequelize, Sequelize) => {
  const JistiRoom = sequelize.define("jitsi_rooms", {
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    room_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    doctor_id: {
      type: Sequelize.INTEGER,
    },
    is_host: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
    },
    is_participant: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
    },
    room_type: {
      type: Sequelize.ENUM('call', 'video')
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

  return JistiRoom;
};