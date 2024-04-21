module.exports = (sequelize, Sequelize) => {
  const BloodParticipants = sequelize.define("blood_participants", {
    blood_bank_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    full_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    age: {
      type: Sequelize.INTEGER,
    },
    phone_no: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    participant_type: {
      type: Sequelize.ENUM('donor', 'recipient'),
      allowNull: false,
    },
    registration_date: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    blood_components: {
      type: Sequelize.JSON,
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

  return BloodParticipants;
};