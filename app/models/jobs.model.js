module.exports = (sequelize, Sequelize) => {
  const Jobs = sequelize.define("jobs", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    clinic_id: {
      type: Sequelize.INTEGER,
    },
    degree_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    speciality_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    company_name: {
      type: Sequelize.STRING,
    },
    image_path: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.JSON,
    },
    experience: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    location: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    salary: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    salary_time: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    job_type: {
      type: Sequelize.ENUM("full_time", "part_time", "night"),
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

  return Jobs;
};