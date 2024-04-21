const db = require("../../../../models");
const _ = require("lodash");
const { methods: commonServices } = require("../../../../services/common");
const { methods: consultationServices, consultationExist } = require("../../../../services/consultation");
const commonResponse = require("./common.response");
const commonFacialService = require("./service");
const message = require("../../message");
const options = require('../../../../config/options');
const Op = db.Sequelize.Op;

const Clinic = db.clinics;
const User = db.users;
const Speciality = db.specialities;
const ClinicSpeciality = db.clinic_specialities;
const ClinicTiming = db.clinic_timings;
const ClinicFacility = db.clinic_facilities;
const Facility = db.facilities;


//get hospital list
exports.getHomeVisitClinicList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { time, day, speciality, page, size } = req.query;
    const { limit, offset } = commonServices.getPagination(page, size);
    const clinic = await commonFacialService.getAllHomeVisitClinic({ time, day, speciality, limit, offset })
    const responseData = commonServices.getPagingData(clinic, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic list") })
    }
    const clinicRes = commonResponse.modifyClinicProfile(response.data)
    const modifyRes = {
      totalItems: response.totalItems,
      data: clinicRes,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Clinic"), data: modifyRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view hospital by id
exports.viewFacialAstheticClinicById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slug } = req.params
    const userData = await commonServices.get(User, { where: { slug: slug } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
    }
    const clinicData = await commonServices.get(Clinic,
      {
        where: { user_id: userData.id },
        attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_phone_number", "address", "pincode", "bio", "service_24X7", "equipments", "consultation_fees", "clinic_image", "has_NABH", "NABH_certificate_path", "has_iso", "iso_certificate_path", "has_lab", "createdAt"],
        include: [
          { model: User, as: "users", attributes: ["slug"] },
          { model: ClinicTiming, as: "clinic_timings", attributes: ["day_of_week", "session_start_time", "session_end_time"] },
          {
            model: ClinicSpeciality, as: "clinic_specialities", attributes: ["id"],
            include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], }]
          },
          {
            model: ClinicFacility, as: "clinic_facilities", required: false,
            include: [{ model: Facility, as: "facilities", attributes: ["id", "name"] }]
          },
        ],
      })
    if (!clinicData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
    }
    const clinicRes = commonResponse.modifyClinicProfile([clinicData])
    return res.status(200).json({ success: "true", message: message.GET_PROFILE("Clinic"), data: clinicRes[0] })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
