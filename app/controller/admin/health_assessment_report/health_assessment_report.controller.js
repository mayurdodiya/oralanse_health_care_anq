const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const { methods: clinicServices } = require("../../../services/clinic");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;




const Treatments = db.treatments;
const HealthAssessmentReports = db.health_assessment_reports;
const User = db.users;
const UserDetails = db.user_details;


// view all employee
exports.viewAllEmployee = async (req, res) => {
  try {
    const { s, page, size } = req.query

    const data = await contentServices.viewAllEmployee({ page, size, s })

    if (data.length != 0) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Employee profile"), data: data })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Employee profile") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view employee assessment history listing
exports.viewEmployeeAllAssementHistory = async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } })
    const employeUserId = user.id;
    const { page, size } = req.query;

    const { limit, offset } = commonServices.getPagination(page, size);

    const query = {
      where: [{ user_id: employeUserId }],
      attributes: ['id', 'user_id', 'score', 'createdAt'],
      include: [
        {
          model: User, as: 'health_assessment_reports_user', attributes: ['id', 'full_name', 'profile_image'],
          include: [
            { model: UserDetails, as: 'user_details', attributes: ['age', 'gender'], }
          ]
        }
      ]
    }

    const allEmployee = await commonServices.getAndCountAll(HealthAssessmentReports, query, limit, offset);
    const data = commonServices.getPagingData(allEmployee, page, limit);
    if (!data) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This employee health assessment history") })
    }

    const response = JSON.parse(JSON.stringify(data))
    return res.status(200).json({ success: "true", message: message.GET_DATA("Employee health assessment history"), data: response });
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};

// view employee assessment history detail
exports.viewEmployeeAssementHistoryDetail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } })
    const employeUserId = user.id;

    const query = {
      where: [{ user_id: employeUserId }],
      attributes: ['id', 'user_id', 'tips', 'score', 'treatments'],
    }
    const data = await commonServices.get(HealthAssessmentReports, query);
    if (!data) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This employee health assessment history") })
    }

    const treatmentsId = await JSON.parse(data.treatments);
    const treatmentsData = await commonServices.getAll(Treatments, { where: { id: treatmentsId }, attributes: ['id', 'name'] })

    const response = JSON.parse(JSON.stringify(data))
    return res.status(200).json({
      success: "true", message: message.GET_DATA("Employee health assessment history"),
      data: {
        id: response.id,
        user_id: response.user_id,
        tips: response.tips,
        score: response.score,
        treatments: treatmentsData,
      }
    });
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};