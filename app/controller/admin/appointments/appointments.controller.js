const db = require("../../../models");
const commonResponse = require('./common.response');
const message = require("../message");
const moment = require("moment");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: consultationServices } = require("../../../services/consultation");
const options = require("../../../config/options");
const Op = db.Sequelize.Op;



const AppointmentRequests = db.appointment_requests;
const User = db.users;
const UserDetails = db.user_details;
const Appointments = db.appointments;
const Patient = db.patients;
const Treatments = db.treatments;
const Specialities = db.specialities;



// view all appoitment details
exports.viewAppoitmentDetail = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { '$patientdata.full_name$': { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: { status: { [Op.ne]: options.appointmentStatus.RESCHEDULE }, ...DataObj },
      attributes: ['id', 'appointment_type', 'doctor_id', 'clinic_id', 'status', 'slot_timing', 'problem_info'],
      include: [
        {
          model: Patient, as: "patientdata", attributes: ['id', 'full_name'],
          include: [
            {
              model: User, as: "usersData", attributes: ['id', 'profile_image'],
              include: [
                { model: UserDetails, as: "user_details", attributes: ['gender', 'age'], }
              ]
            },
          ]
        },
        { model: Treatments, as: "treatmentdata", attributes: ['id', 'name'] },
        { model: Specialities, as: "specialitydata", attributes: ['id', 'name'] },
      ],
      order: [["id", "DESC"]]
    };
    let data = await commonServices.getAndCountAll(Appointments, query, limit, offset)
    if (data) {
      const pagination = commonServices.getPagingData(data, page, limit);

      let responseData = JSON.parse(JSON.stringify(pagination));
      responseData.data = responseData.data.map(item => {
        if (item.appointment_type == options.appointmentType.INCLINIC) {
          item.type_flag = "appointment"
        } else if (item.appointment_type == options.appointmentType.ONLINECHAT || item.appointment_type == options.appointmentType.VOICECALL || item.appointment_type == options.appointmentType.VIDEOCALL) {
          item.type_flag = "online"
        } else if (item.appointment_type == options.appointmentType.ATHOME) {
          item.type_flag = "athome"
        }
        return item
      })

      res.status(200).json({ success: "true", message: message.GET_DATA("Appointment data"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This appointment") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all upcoming appoitment
exports.viewUpcomingAppoitment = async (req, res) => {

  try {

    let startDate = req.body.start_date;
    let endDate = req.body.end_date;

    const { page, size, s, status, type } = req.query;

    const query = {
      // where: { slot_timing: { [Op.between]: [startDate, endDate] }, status: status },
      where: { [Op.or]: [{ slot_timing: { [Op.lte]: endDate, [Op.gte]: startDate, } }], status: status },
      attributes: ["id", "appointment_type", "patient_id", "status", "slot_timing", "treatment_id", "speciality_id", "createdAt"],
      include: [
        { model: Patient, as: "patientdata", attributes: ["user_id", "unique_id", "full_name", /* "profile_image" */] },
        { model: Treatments, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Specialities, as: "specialitydata", required: false, attributes: ["name"] }
      ],
      order: [["id", "DESC"]]
    }

    const response = await consultationServices.getAllConsultationList(query, { type, status, page, size })

    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    const appointmentRes = commonResponse.modifyAppointment(response.data)
    const responseData = {
      totalItems: response.totalItems,
      data: appointmentRes,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Appointment"), data: responseData })

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message })
  }

};

// view past appointment/consultation listing by id
exports.viewPastAppoitmentById = async (req, res) => {

  try {
    const { page, size, s, type } = req.query;
    const slug = req.params.slug;
    const status = options.appointmentStatus.COMPLETED;
    const user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patients profile") })
    }
    const userId = user.id;

    const userData = await commonServices.get(Patient, { where: { user_id: userId } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patients profile") })
    }
    const patientId = userData.id;

    const query = {
      where: { patient_id: patientId, status: { [Op.or]: [options.appointmentStatus.COMPLETED] } },
      attributes: ["id", "appointment_type", "patient_id", "status", "slot_timing", "treatment_id", "speciality_id", "createdAt"],
      include: [
        { model: Patient, as: "patientdata", attributes: ["user_id", "unique_id", "full_name"] },
        { model: Treatments, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Specialities, as: "specialitydata", required: false, attributes: ["name"] }
      ],
      order: [["id", "DESC"]]
    }

    const response = await consultationServices.getAllConsultationList(query, { type, status, page, size })

    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    const appointmentRes = commonResponse.modifyAppointment(response.data)
    const responseData = {
      totalItems: response.totalItems,
      data: appointmentRes,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Appointment"), data: responseData })

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message })
  }

};

// cancel appointment/consultation by id
exports.cancleAppoitmentById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(Appointments, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }

    const userData = commonServices.update(Appointments, { where: { id: id } }, { status: "cancelled" })
    if (userData != 0) {
      return res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Appointment") });
    } else {
      return res.status(200).json({ success: "false", message: message.NOT_UPDATE("Appointment status") });
    }


  } catch (error) {

    res.status(200).json({ success: " false", message: error.message })
  }

};

// reschedule appointment/consultation
exports.rescheduleAppoitmentById = async (req, res) => {

  try {
    const adminId = req.user.id;
    const slug = req.params.slug;
    const doctor_id = req.body.doctor_id || []
    const clinic_id = req.body.clinic_id || []
    const appointment_id = req.body.appointment_id || []

    const user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") });
    }
    const userId = user.id;
    const patientData = await commonServices.get(Patient, { where: { user_id: userId } })
    if (!patientData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") });
    }
    const patientId = patientData.id;

    const users = await commonServices.get(Appointments, { where: { patient_id: patientId } })
    if (!users) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") });
    } else {

      const userData = await commonServices.update(Appointments, { where: { id: appointment_id } }, { status: "reschedule" })
      if (userData != 0) {
        const abc = await consultationServices.bookAppointment(req, res, userId, patientId, clinic_id, doctor_id, adminId);
        return res.status(200).json({ success: "true", message: message.RECHEDULE_SUCCESS("Appointment") });
      } else {
        return res.status(200).json({ success: "false", message: message.RECHEDULE_FAILD("Appointment") });
      }
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};