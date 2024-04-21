module.exports = (sequelize, Sequelize) => {
  const OralDoctors = sequelize.define("oral_doctors", {
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
    registration_number: {
      type: Sequelize.STRING,
    },
    degree_id: {
      type: Sequelize.INTEGER,
    },
    college_id: {
      type: Sequelize.INTEGER,
    },
    year: {
      type: Sequelize.INTEGER,
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

  return OralDoctors;
};