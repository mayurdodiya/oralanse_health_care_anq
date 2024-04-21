module.exports = (sequelize, Sequelize) => {
  const UserBankDetails = sequelize.define('user_bank_details', {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    transaction_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    bank_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    account_holder_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    account_number: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    ifsc_code: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
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
  })
  return UserBankDetails
}