module.exports = (sequelize, Sequelize) => {
  const JobApplicants = sequelize.define("job_applicants", {
    job_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    full_name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    phone_no: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
    },
    experience: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    current_job: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    current_salary: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    current_salary_time: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    skill: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    resume_path: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.STRING,
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

  return JobApplicants;
};