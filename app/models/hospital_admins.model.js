module.exports = (sequelize, Sequelize) => {
  const HospitalAdmins = sequelize.define("hospital_admins", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    proof_type: {
      type: Sequelize.ENUM("pan_card", "aadhaar_card", "election_card", "license"),
      allowNull: false,
    },
    identity_proof_doc_path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    is_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
    },
    wallet_balance: {
      type: Sequelize.FLOAT,
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

  return HospitalAdmins;
};