module.exports = (sequelize, Sequelize) => {
  const Clinics = sequelize.define("clinics", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    clinic_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    clinic_type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    clinic_phone_number: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    pincode: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    bio: {
      type: Sequelize.STRING
    },
    clinic_image: {
      type: Sequelize.STRING
    },
    location: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    latitude: {
      type: Sequelize.FLOAT,
    },
    longitude: {
      type: Sequelize.FLOAT,
    },
    status: {
      type: Sequelize.ENUM("approved", "disapprove", "pending"),
      defaultValue: "pending",
    },
    consultation_fees: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    rating_point: {
      type: Sequelize.FLOAT,
    },
    has_ambulance: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    ambulance_type: {
      type: Sequelize.ENUM("basic", "advance"),
    },
    service_24X7: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    document_type: {
      type: Sequelize.ENUM("electricity_bill", "license_certificate", "rent_agreement")
    },
    document_path: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    equipments: {
      type: Sequelize.JSON,
    },
    home_visit: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    has_NABH: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    NABH_certificate_path: {
      type: Sequelize.STRING
    },
    has_iso: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    iso_certificate_path: {
      type: Sequelize.STRING
    },
    has_lab: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
    },
    has_pharmacy: {
      type: Sequelize.BOOLEAN,
      defaultValue: 0,
      allowNull: false,
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

  return Clinics;
};