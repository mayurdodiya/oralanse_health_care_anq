const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: consultationServices } = require("../../../../services/consultation");
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const endUserServices = require("../../services");
const emailServices = require("../../../../services/email");
const uploadService = require("../../../../services/uploadFile");
const commonResponse = require("./common.response");
const authServices = require("./service");
const commonConfig = require("../../../../config/common.config");
const message = require("../../message");
const config = require("../../../../config/config.json");
const options = require('../../../../config/options');
const Op = db.Sequelize.Op;

const User = db.users;
const UserDetails = db.user_details;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const Patient = db.patients;
const Otps = db.otps;
const DeviceToken = db.device_tokens;
const City = db.cities;
const UserSubrole = db.user_subroles;
const Area = db.areas;
const DoctorTiming = db.doctor_timings;
const Doctors = db.doctors;
const Clinics = db.clinics;
const Jobs = db.jobs;
const StaticPages = db.static_pages;
const Treatments = db.treatments;
const Specialities = db.specialities;
const AppointmentRequest = db.appointment_requests;
const Appointments = db.appointments;



// job listing
exports.jobListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = { where: {}, order: [["createdAt", "DESC"]] }

    const data = await commonServices.getAll(Jobs, query)
    const response = await commonResponse.viewAllJobsResponse(data)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Jobs"), data: response });

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// recommended (trending) product listing
exports.getTrendingProductList = async (req, res) => {
  try {

    const { page, size } = req.query;
    const data = await ecommerceService.getTrendingProducts({ page, size, categoryType: options.PortalType.DOCTOR });
    return res.status(200).json({ success: "true", message: message.GET_DATA("Product categories"), data: data })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all appointment & consultation request listing
exports.consultationListing = async (req, res) => {
  // params type  --> online,home,clinic only otherwise error.
  try {
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;
    console.log(doctorId, '-----------------------------------------------');

    const { page, size, s, status, type } = req.query;

    const query = {
      where: { doctor_id: doctorId, status: status }, order: [],
      attributes: ["id", "doctor_id", "patient_id", "appointment_type", "status", "is_addon", "addon_status", "speciality_id", "createdAt"],
      include: [
        {
          model: Patient, as: "patients", attributes: ["user_id", "unique_id", "full_name"],
          include: [
            {
              model: User, as: "usersData", attributes: ["id", "slug", "profile_image"],
              include: [
                { model: UserDetails, as: "user_details", attributes: ["age", "gender"], }
              ]
            },
          ]
        },
        { model: Specialities, as: "specialities", attributes: ["id", "name"] },
        { model: Appointments, as: "appointments", attributes: ["id", "problem_info", "slot_timing"] },
      ],
    }
    const response = await consultationServices.getAllConsultationListOfDoctor(query, { type, page, size })
    // const appointmentRes = commonResponse.modifyAppointment(response)
    return res.status(200).json({
      success: "true",
      message: message.GET_LIST("Consultant"),
      // data: appointmentRes
      data: response
    })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }
};

// view doctor privacy policy page
exports.viewDoctorPrivacyPolicyPage = async (req, res) => {
  try {
    // add static entry in data base
    const slug = "privacy_policy";
    const query = { 
      where: { slug: slug },
     }

    const data = await commonServices.get(StaticPages, query)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Privacy policy"), data: data });

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};