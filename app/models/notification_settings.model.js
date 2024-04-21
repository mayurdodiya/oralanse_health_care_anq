module.exports = (sequelize, Sequelize) => {
  const NotificationSetting = sequelize.define("notification_settings", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    patient_notification: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    doctor_notification: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    hospital_notification: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    nurse_notification: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    staff_notification: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    appointment_reminders: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    do_not_disturb: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    sound_and_vibration: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    prescription_updates: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    promotions_offer: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    },
    general_updates: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
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

  return NotificationSetting;
};