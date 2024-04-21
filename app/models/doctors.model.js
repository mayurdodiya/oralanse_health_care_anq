module.exports = (sequelize, Sequelize) => {
  const Doctors = sequelize.define("doctors", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    doctor_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    prefix: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    experience: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    known_language: {
      type: Sequelize.JSON,
    },
    status: {
      type: Sequelize.ENUM("approve", "disapprove", "pending"),
      defaultValue: "pending"
    },
    rating_point: {
      type: Sequelize.FLOAT,
    },
    consultation_fees: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    document_type: {
      type: Sequelize.ENUM("pan_card", "aadhaar_card", "election_card", "license"),
      allowNull: false,
    },
    front_side_document: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    back_side_document: {
      type: Sequelize.STRING,
    },
    wallet_balance: {
      type: Sequelize.FLOAT,
    },
    bio: {
      type: Sequelize.STRING
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

  return Doctors;
};