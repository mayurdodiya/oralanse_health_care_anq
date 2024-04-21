module.exports = (sequelize, Sequelize) => {
  const DeviceToken = sequelize.define("device_tokens", {
    user_id: {
      type: Sequelize.INTEGER
    },
    device_token: {
      type: Sequelize.STRING
    }
  });

  return DeviceToken;
};