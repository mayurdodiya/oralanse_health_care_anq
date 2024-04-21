const db = require('../models');
const { Sequelize } = require('../models');
const { methods: commonServices } = require("./common");
const _ = require("lodash");
const message = require("./message");
const moment = require("moment");
const options = require("../config/options");
const bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;
const fcmNotificationPayload = require("../services/fcm_notification_payload");
const sendAllNotification = require("../services/settings");



const Appointments = db.appointments;
const AssignBeds = db.assign_beds;
const Beds = db.beds;
const User = db.users;
const UserDetails = db.user_details;
const Clinic = db.clinics;
const LabTest = db.lab_tests;
const ClinicSpeciality = db.clinic_specialities;
const ClinicTiming = db.clinic_timings;
const ClinicFacility = db.clinic_facilities;
const Degree = db.degrees;
const Doctor = db.doctors;
const DoctorSpeciality = db.doctor_specialities;
const DoctorTiming = db.doctor_timings;
const DoctorEducation = db.doctor_educations;
const DoctorAchievement = db.doctor_achievements;
const ClinicDoctorRelation = db.clinic_doctor_relations;
const AppointmentRequest = db.appointment_requests;
const Appointment = db.appointments;
const Speciality = db.specialities;
const Facility = db.facilities;
const Treatment = db.treatments;
const Symptoms = db.symptoms;
const Disease = db.diseases;
const AppointmentDocument = db.appointment_documents;
const Pharmacy = db.pharmacies;
const Patients = db.patients;
const PatientMedicine = db.patient_medicines;
const PatientTreatment = db.patient_treatments;
const PatientPrescriptionDoc = db.prescription_documents;
const PatientSymptom = db.patient_symptoms;
const PatientDiseases = db.patient_diseases;
const PatientBilling = db.patient_billings;
const PatientTransactions = db.patient_transactions;
const Transactions = db.transactions;
const UserReview = db.user_reviews;
const AppointmentOrder = db.appointment_orders;
const JitsiRoom = db.jitsi_rooms;
const Medicines = db.medicines;
const LabTestPatients = db.lab_test_patients;
const PatientSuggestedLabtest = db.patient_suggested_labtest;
const LabTestClinics = db.lab_test_clinics;
const PharmacyOrders = db.pharmacy_orders;
const PharmacyOrderDetails = db.pharmacy_order_details;

const consultationExist = async (data) => {
  return await commonServices.checkFlag(Appointment,
    {
      where: {
        appointment_type: data.appointment_type,
        user_id: data.userId,
        patient_id: data.patient_id,
        doctor_id: null,
        clinic_id: null,
        status: options.appointmentStatus.REQUESTED,
        slot_timing: data.slot_timing,
        treatment_id: data.treatment_id || null,
        speciality_id: data.speciality_id || null
      }
    })
    .then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    });
}

const labAppointmentExist = async (data) => {
  return await commonServices.checkFlag(Appointment,
    {
      where: {
        appointment_type: data.appointment_type,
        user_id: data.userId,
        patient_id: data.patient_id,
        doctor_id: null,
        clinic_id: data.clinicId,
        status: options.appointmentStatus.REQUESTED,
        slot_timing: data.slot_timing,
        treatment_id: null,
        speciality_id: null
      }
    })
    .then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    });
}

const methods = {
  getAllSpecialities: async (query, page, size) => {
    query = {
      ...query,
      where: { is_active: true, ...query.where },
      order: [...query.order, ['createdAt', 'DESC']]
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    const speciality = await commonServices.getAndCountAll(Speciality, query, limit, offset)
    const responseData = commonServices.getPagingData(speciality, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    return response
  },
  getAllTreatments: async (query, page, size) => {
    query = {
      ...query,
      where: { is_active: true, ...query.where },
      order: [...query.order, ['createdAt', 'DESC']]
    }
    const { limit, offset } = commonServices.getPagination(page, size);
    const treatment = await commonServices.getAndCountAll(Treatment, query, limit, offset)
    const responseData = commonServices.getPagingData(treatment, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    return response
  },
  addAllLanguageSearch: (key, search) => {
    const querySch = Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(${key}, '$[0]')) LIKE '%${search}%'`)
    return querySch
  },
  bookAppointment: async (req, res, userId, patientId, clinic_id, doctor_id, adminId) => {
    const t = await db.sequelize.transaction();
    try {
      if (patientId == null) {
        const patientData = await commonServices.get(Patients, { where: { id: patientId } }, { transaction: t })
        var patientUserId = patientData.user_id;
      }

      const consultation = await commonServices.create(Appointment, {
        appointment_type: req.body.appointment_type,
        user_id: patientUserId || userId,
        patient_id: patientId,
        doctor_id: null,
        clinic_id: null,
        status: req.body.status || options.appointmentStatus.REQUESTED,
        slot_timing: req.body.slot_timing,
        problem_info: req.body.problem_info,
        treatment_id: req.body.treatment_id || null,
        speciality_id: req.body.speciality_id || null,
        createdBy: adminId || userId,
      }, { transaction: t })
      if (!consultation) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
      }
      const docArr = []
      if (req.body.documents.length != 0) {
        req.body.documents.forEach(item => {
          docArr.push({
            appointment_id: consultation.id,
            media_name: "Appointment",
            media_type: item.media_type || options.mediaType.IMAGE,
            media_path: item.doc_path,
            createdBy: adminId || userId,
          })
        })
      }
      const appointmentDoc = await commonServices.bulkCreate(AppointmentDocument, docArr, { transaction: t })
      if (!appointmentDoc) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
      }
      const newReqBody = []
      const addConsultation = (params) => {
        newReqBody.push({
          appointment_id: consultation.id,
          patient_id: patientId,
          status: req.body.status || options.appointmentStatus.REQUESTED,
          createdBy: adminId || userId,
          ...params
        })
      }

      if (doctor_id.length != 0) {
        if (doctor_id.length > options.appointmentLimit.DOCTOR_SELECTION) {
          return res.status(200).json({ success: "false", message: message.REQUEST_LIMIT("consultation", options.appointmentLimit.DOCTOR_SELECTION) })
        }
        for (const doctorId of doctor_id) {
          addConsultation({ doctorId, ...req.body });
        }
        newReqBody.forEach((obj) => {
          obj.doctor_id = obj.doctorId;
          delete obj.doctorId;
        });
      }
      if (clinic_id.length != 0) {
        if (clinic_id.length > options.appointmentLimit.HOSPITAL_SELECTION) {
          return res.status(200).json({ success: "false", message: message.REQUEST_LIMIT("appointment", options.appointmentLimit.HOSPITAL_SELECTION) })
        }
        for (const clinicId of clinic_id) {
          addConsultation({ clinicId, ...req.body });
        }
        newReqBody.forEach((obj) => {
          obj.clinic_id = obj.clinicId;
          delete obj.clinicId;
        });
      }
      const consultationReq = await commonServices.bulkCreate(AppointmentRequest, newReqBody, { transaction: t })
      if (!consultationReq) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
      }
      if (consultation.appointment_type == options.appointmentType.VIDEOCALL || consultation.appointment_type == options.appointmentType.VOICECALL) {
        let roomType = consultation.appointment_type == options.appointmentType.VIDEOCALL ? options.jitsiRoomType.VIDEO : options.jitsiRoomType.CALL
        const createJitsiRoom = await commonServices.create(JitsiRoom, {
          appointment_id: consultation.id,
          patient_id: patientId,
          room_id: commonServices.generateUniqueId(30),
          room_type: roomType
        }, { transaction: t })
        if (!createJitsiRoom) {
          await t.rollback()
          return res.status(200).json({ success: "false", message: message.ADD_DATA("Voice or video call room") })
        }
      }
      await t.commit()
      // for push notification -----------
      if (clinic_id) {
        if (clinic_id.length != 0) {
          for (let z = 0; z < clinic_id.length; z++) {
            const user = await commonServices.get(Clinic, { where: { id: clinic_id[z] } })
            const userId = user.user_id;
            const payload = fcmNotificationPayload.bookAppointment({ userId: userId })
            await sendAllNotification.sendAllNotification({ payload })
          }
        }
      }

      if (doctor_id) {
        if (doctor_id.length != 0) {
          for (let z = 0; z < doctor_id.length; z++) {
            const user = await commonServices.get(Doctor, { where: { id: doctor_id[z] } })
            const userId = user.user_id
            const payload = fcmNotificationPayload.bookAppointment({ userId: userId })
            await sendAllNotification.sendAllNotification({ payload })
          }
        }
      }

      return consultation;
    } catch (error) {
      console.log(error);
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
  },
  admitNewPatientAppointment: async (req, res, userId, patientId, clinic_id, doctor_id, adminId) => {
    const t = await db.sequelize.transaction();
    try {
      if (patientId == null) {
        const patientData = await commonServices.get(Patients, { where: { id: patientId } }, { transaction: t })
        var patientUserId = patientData.user_id;
      }

      const consultation = await commonServices.create(Appointment, {
        appointment_type: req.body.appointment_type,
        user_id: patientUserId || userId,
        patient_id: patientId,
        doctor_id: null,
        clinic_id: null,
        status: req.body.status || options.appointmentStatus.REQUESTED,
        slot_timing: req.body.slot_timing,
        type: req.body.type,
        problem_info: req.body.problem_info,
        treatment_id: req.body.treatment_id || null,
        speciality_id: req.body.speciality_id || null,
        createdBy: adminId || userId,
      }, { transaction: t })
      if (!consultation) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
      }
      const docArr = []
      if (req.body.documents.length != 0) {
        req.body.documents.forEach(item => {
          docArr.push({
            appointment_id: consultation.id,
            media_name: "Appointment",
            media_type: item.media_type || options.mediaType.IMAGE,
            media_path: item.doc_path,
            createdBy: adminId || userId,
          })
        })
      }
      const appointmentDoc = await commonServices.bulkCreate(AppointmentDocument, docArr, { transaction: t })
      if (!appointmentDoc) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
      }
      const newReqBody = []
      const addConsultation = (params) => {
        newReqBody.push({
          appointment_id: consultation.id,
          patient_id: patientId,
          status: req.body.status || options.appointmentStatus.REQUESTED,
          createdBy: adminId || userId,
          ...params
        })
      }

      if (doctor_id.length != 0 && clinic_id.length != 0) {

        addConsultation({ clinic_id, doctor_id, ...req.body });

        newReqBody.forEach((obj) => {
          obj.doctor_id = obj.doctor_id;
          obj.clinic_id = obj.clinic_id;
        });
      }

      const consultationReq = await commonServices.bulkCreate(AppointmentRequest, newReqBody, { transaction: t })
      if (!consultationReq) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
      }

      await t.commit()

      // for push notification -----------
      if (clinic_id) {
        if (clinic_id.length != 0) {
          for (let z = 0; z < clinic_id.length; z++) {
            const user = await commonServices.get(Clinic, { where: { id: clinic_id[z] } })
            const userId = user.user_id;
            const payload = fcmNotificationPayload.bookAppointment({ userId: userId })
            await sendAllNotification.sendAllNotification({ payload })
          }
        }
      }

      if (doctor_id) {
        if (doctor_id.length != 0) {
          for (let z = 0; z < doctor_id.length; z++) {
            const user = await commonServices.get(Doctor, { where: { id: doctor_id[z] } })
            const userId = user.user_id
            const payload = fcmNotificationPayload.bookAppointment({ userId: userId })
            await sendAllNotification.sendAllNotification({ payload })
          }
        }
      }

      return consultation;
    } catch (error) {
      console.log(error);
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
  },
  getAllConsultantDoctors: async (data) => {

    var searchData = {};
    if (data.s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { '$users.full_name$': { [Op.like]: `%${data.s}%` } },
          { '$doctor_educations.degrees.name$': { [Op.like]: `%${data.s}%` } }
        ]
      }
    }
    const genderFilter = {}
    if (data.gender) {
      genderFilter.gender = data.gender
    }
    let experienceFilter = {}
    if (data.experience != "") {
      experienceFilter = data.experience ? { 'experience': { [Op.gte]: data.experience } } : "";
    }
    let satisfiedPatientFilter = {}
    if (data.satisfyPatient != "") {
      if (data.satisfyPatient == 25) {
        satisfiedPatientFilter = data.satisfyPatient ? { 'rating_point': { [Op.lt]: 2 } } : "";
      } else if (data.satisfyPatient == 50) {
        satisfiedPatientFilter = data.satisfyPatient ? { 'rating_point': { [Op.and]: { [Op.gte]: 2, [Op.lt]: 3 } } } : "";
      } else if (data.satisfyPatient == 75) {
        satisfiedPatientFilter = data.satisfyPatient ? { 'rating_point': { [Op.and]: { [Op.gte]: 3, [Op.lte]: 4 } } } : "";
      } else if (data.satisfyPatient == 90) {
        satisfiedPatientFilter = data.satisfyPatient ? { 'rating_point': { [Op.gt]: 4 } } : "";
      }
    }
    let arr1 = []
    var doctorSpeciality = await commonServices.getAll(DoctorSpeciality, { attributes: ["id", "doctor_id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], where: { name: data.speciality } }] })
    doctorSpeciality.length != 0 && doctorSpeciality.map(i => { arr1.push(i.doctor_id) })
    let arr2 = []
    const doctorTime = await commonServices.getAll(DoctorTiming, {
      attributes: ["doctor_id", "day_of_week", "session_start_time", "session_end_time"],
      where: { day_of_week: data.day, consultation: true, [Op.and]: [{ session_start_time: { [Op.lte]: data.time } }, { session_end_time: { [Op.gte]: data.time } }] }
    })
    doctorTime.length != 0 && doctorTime.map(i => { arr2.push(i.doctor_id) })
    const idArr = arr1.filter(id => arr2.includes(id));
    const doctor = await commonServices.getAndCountAll(Doctor, {
      where: { status: options.DoctorStatus.APPROVE, user_id: { [Op.ne]: data.userId }, id: idArr, ...searchData, ...experienceFilter, ...satisfiedPatientFilter },
      attributes: ["id", "user_id", "prefix", "doctor_type", "bio", "experience", "known_language", "consultation_fees", "rating_point", "createdAt"],
      include: [
        { model: User, as: "users", attributes: ["full_name", "slug", "profile_image"], include: [{ model: UserDetails, as: "user_details", attributes: ["gender"], required: false, where: { ...genderFilter } }] },
        { model: DoctorEducation, as: "doctor_educations", attributes: ["year"], include: [{ model: Degree, as: "degrees", attributes: ["name"] }] },
        { model: DoctorTiming, as: "doctor_timing", attributes: ["day_of_week", "session_start_time", "session_end_time"] },
        {
          model: DoctorSpeciality, as: "doctor_specialities", attributes: ["id"],
          include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], }]
        },
        { model: DoctorAchievement, as: "doctorAchievement", required: false, attributes: ["name"] },
        { model: UserReview, as: "doctorReview", required: false, attributes: ["id"] },
        { model: ClinicDoctorRelation, as: "clinic_doctor_relations", required: true, include: [{ model: Clinic, as: "clinics", attributes: ["clinic_name"] }] }
      ],
      distinct: true
    }, data.limit, data.offset)
    return doctor
  },
  getAllClinics: async (data) => {
    let arr1 = []
    var clinicSpeciality = await commonServices.getAll(ClinicSpeciality, { attributes: ["id", "clinic_id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], where: { name: data.speciality } }] })
    clinicSpeciality.length != 0 && clinicSpeciality.map(i => { arr1.push(i.clinic_id) })
    let arr2 = []
    const clinicTime = await commonServices.getAll(ClinicTiming, {
      attributes: ["clinic_id", "day_of_week", "session_start_time", "session_end_time"],
      where: { day_of_week: data.day, in_clinic_appointment: true, [Op.and]: [{ session_start_time: { [Op.lte]: data.time } }, { session_end_time: { [Op.gte]: data.time } }] }
    })
    clinicTime.length != 0 && clinicTime.map(i => { arr2.push(i.clinic_id) })
    const idArr = arr1.filter(id => arr2.includes(id));
    const clinic = await commonServices.getAndCountAll(Clinic, {
      where: { status: options.ClinicStatus.APPROVE, id: idArr },
      attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_phone_number", "address", "pincode", "bio", "service_24X7", "rating_point", "equipments", "consultation_fees", "clinic_image", "has_NABH", "NABH_certificate_path", "has_iso", "iso_certificate_path", "has_lab", "createdAt"],
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
        { model: UserReview, as: "clinicReview", required: false, attributes: ["id"] },
        { model: Beds, as: "clinicBed", required: false, attributes: ["id"] },
      ],
      distinct: true
    }, data.limit, data.offset)
    return clinic
  },
  getAllConsultationList: async (query, data) => {

    var searchData = {};
    if (data.status != options.appointmentStatus.REQUESTED && data.type == "online") {
      if (data.s) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { '$patientdata.full_name$': { [Op.like]: `%${data.s}%` } },
            { '$patientdata.gender$': { [Op.like]: `%${data.s}%` } },
            { '$patientdata.unique_id$': { [Op.like]: `%${data.s}%` } },
            { '$specialitydata.name$': { [Op.like]: `%${data.s}%` } },
            // { '$doctors.users.full_name$': { [Op.like]: `%${data.s}%` } }
          ]
        }
      }
    }
    if (data.status != options.appointmentStatus.REQUESTED && data.type == "clinic") {
      if (data.s) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { '$patientdata.full_name$': { [Op.like]: `%${data.s}%` } },
            { '$patientdata.gender$': { [Op.like]: `%${data.s}%` } },
            { '$patientdata.unique_id$': { [Op.like]: `%${data.s}%` } },
            { '$specialitydata.name$': { [Op.like]: `%${data.s}%` } },
            // { '$doctors.doctor_type$': { [Op.like]: `%${data.s}%` } },
            // { '$doctors.users.full_name$': { [Op.like]: `%${data.s}%` } },
            // { '$clinicdata.clinic_name$': { [Op.like]: `%${data.s}%` } },
            // { '$clinicdata.clinic_type$': { [Op.like]: `%${data.s}%` } },
          ]
        }
      }
    }
    query = {
      ...query,
      where: { ...query.where, ...searchData },
      order: [...query.order, ['createdAt', 'DESC']]
    }
    if (data.type == "online") {
      query.where.appointment_type = {
        [Op.or]: [options.appointmentType.ONLINECHAT, options.appointmentType.VIDEOCALL, options.appointmentType.VOICECALL]
      }
    }
    if (data.type == "clinic") {
      query.where.appointment_type = options.appointmentType.INCLINIC
    }
    if (data.type == "home") {
      query.where.appointment_type = options.appointmentType.ATHOME
    }
    if (data.type == "lab") {
      query.where.appointment_type = {
        [Op.or]: [options.appointmentType.HOMELABTEST, options.appointmentType.CLINICLABTEST]
      }
    }
    if (data.status != options.appointmentStatus.REQUESTED && data.type == "online") {
      const doctordata = {
        model: Doctor, as: "doctors",
        attributes: ["id", "user_id", "doctor_type", "prefix", "experience"],
        include: [{ model: User, as: "users", attributes: ["full_name", "profile_image"] },
        { model: DoctorSpeciality, as: "doctor_specialities", attributes: ["id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"] }] },
        ]
      }
      query.include.push(doctordata)
    }
    if (data.status != options.appointmentStatus.REQUESTED && data.type == "clinic") {
      const clinicdata = {
        model: Clinic, as: "clinicdata",
        attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_image"],
        include: [
          {
            model: ClinicSpeciality, as: "clinic_specialities", attributes: ["id"],
            include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], }]
          }]
      }
      const doctorData = {
        model: Doctor, as: "doctors",
        attributes: ["id", "user_id", "doctor_type", "prefix", "experience"],
        include: [{ model: User, as: "users", attributes: ["full_name", "profile_image"] },
        { model: DoctorSpeciality, as: "doctor_specialities", attributes: ["id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"] }] },
        ]
      }
      const queryInclude = [clinicdata, doctorData]
      query.include.push(...queryInclude)
    }
    if (data.status != options.appointmentStatus.REQUESTED && data.type == "lab") {
      const clinicdata = {
        model: Clinic, as: "clinicdata",
        attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_image"],
        include: [
          {
            model: ClinicSpeciality, as: "clinic_specialities", attributes: ["id"],
            include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], }]
          }]
      }
      const queryInclude = [clinicdata]
      query.include.push(...queryInclude)
    }
    const { limit, offset } = commonServices.getPagination(data.page, data.size);
    const appointment = await commonServices.getAndCountAll(Appointment, query, limit, offset)
    const responseData = commonServices.getPagingData(appointment, data.page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    return response
  },
  getAllConsultationListOfDoctor: async (query, data) => {
    try {
      query = {
        ...query,
        order: [...query.order, ['createdAt', 'DESC']]
      }
      if (data.type == "online") {
        query.where.appointment_type = {
          [Op.or]: [options.appointmentType.ONLINECHAT, options.appointmentType.VIDEOCALL, options.appointmentType.VOICECALL]
        }
      }
      if (data.type == "clinic") {
        query.where.appointment_type = options.appointmentType.INCLINIC
      }
      if (data.type == "home") {
        query.where.appointment_type = options.appointmentType.ATHOME
      }

      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const appointment = await commonServices.getAndCountAll(AppointmentRequest, query, limit, offset)
      const responseData = commonServices.getPagingData(appointment, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response
    } catch (error) {
      return error
    }

  },
  getAllAppointmentListOfClinic: async (data) => {
    try {
      const query = {
        where: { clinic_id: data.clinicId, status: data.status, appointment_type: data.type }, order: [['createdAt', 'DESC']],
        attributes: ["id", "doctor_id", "patient_id", "appointment_type", "type", "status", "is_addon", "addon_status", "createdAt"],
        include: [
          {
            model: Patients, as: "patients", attributes: ["user_id", "unique_id", "full_name", "profile_image"],
            include: [
              {
                model: User, as: "usersData", attributes: ["id", "slug", "profile_image"],
                include: [
                  { model: UserDetails, as: "user_details", attributes: ["id", "gender", "age"], }
                ]
              },
            ]
          },
          {
            model: Doctor, as: "doctors", required: false, attributes: ["id", "doctor_type", "rating_point"],
            include: [
              { model: User, as: "users", required: false, attributes: ["id", "full_name", "profile_image"], }
            ]
          },
          {
            model: Appointment, as: "appointments", required: false, attributes: ["id", "problem_info", "slot_timing", "speciality_id"],
            include: [
              { model: Speciality, as: "specialitydata", required: false, attributes: ["id", "name"], }
            ]
          },
        ],
      }
      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const appointment = await commonServices.getAndCountAll(AppointmentRequest, query, limit, offset)
      const responseData = commonServices.getPagingData(appointment, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response
    } catch (error) {
      return error
    }
  },
  getConsultationRequestById: async (query, data) => {
    query = {
      ...query
    }

    if (data.type == "online") {
      query.where.appointment_type = {
        [Op.or]: [options.appointmentType.ONLINECHAT, options.appointmentType.VIDEOCALL, options.appointmentType.VOICECALL]
      }
      if (data.status == options.appointmentStatus.REQUESTED) {
        const joindata = {
          model: AppointmentRequest, as: "appointmentRequest", attributes: ["doctor_id", "status"], where: { is_addon: false },
          include: [{
            model: Doctor, as: "doctordata", attributes: ["doctor_type", "prefix", "experience", "rating_point"], include: [{
              model: User, as: "users", attributes: ["full_name", "profile_image"]
            }]
          }]

        }
        query.include.push(joindata)
      }
      if (data.status == options.appointmentStatus.UPCOMING) {
        const joindata = {
          model: Doctor, as: "doctors", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }, { model: UserReview, as: "doctorReview", required: false, attributes: ["id"] }]
        }
        const transactionData = {
          model: PatientTransactions, as: "patientTransaction", attributes: ["id", "order_number", "payment_method", "amount", "remarks"],
          include: [{
            model: AppointmentOrder, as: "appointmentOrder", attributes: ["sub_total", "discount", "net_total"]
          }]
        }
        query.include.push(joindata)
        query.include.push(transactionData)
      }
      if (data.status == options.appointmentStatus.INPROCESS) {
        const joindata = {
          model: Doctor, as: "doctors", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }, { model: UserReview, as: "doctorReview", required: false, attributes: ["id"] }]
        }
        const transactionData = {
          model: PatientTransactions, as: "patientTransaction", attributes: ["id", "order_number", "payment_method", "amount", "remarks"],
          include: [{
            model: AppointmentOrder, as: "appointmentOrder", attributes: ["sub_total", "discount", "net_total"]
          }]
        }
        const appointmentDoc = {
          model: AppointmentDocument, as: "appointmentDoc", attributes: ["media_type", "media_path"]
        }
        const Medicine = {
          model: PatientMedicine, as: "patientMedicine", required: false, attributes: ["id", "medicine_id", "dose", "duration", "repeat", "day_time", "taken_time"],
          include: [{ model: Medicines, as: "pharmacy", attributes: ["name", "dosage"] }]
        }
        const suggestTreatment = {
          model: PatientTreatment, as: "patientTreatment", required: false, attributes: ["id", "patient_id", "treatment_id", "createdAt"],
          include: [{ model: Treatment, as: "treatmentData", attributes: ["name", "description"] }]
        }
        const patientSymptoms = {
          model: PatientSymptom, as: "patientSymptom", required: false, attributes: ["id", "patient_id", "symptoms_id", "description"],
          include: [{ model: Symptoms, as: "symptoms", attributes: ["name"/* , "description" */] }]
        }
        const patientDiseases = {
          model: PatientDiseases, as: "patientDiseases", required: false, attributes: ["id", "patient_id", "disease_id"],
          include: [{ model: Disease, as: "diseases", attributes: ["name", "description"] }]
        }
        const addonDoctor = {
          model: Doctor, as: "addonDoctor", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }
        const prescriptionDoc = {
          model: PatientPrescriptionDoc, as: "patientPrescription", required: false, limit: 4, attributes: ["id", "doc_name", "doc_path"],
          // include: [{ model: User, as: "userPreacription", attributes: ["full_name"], include: [{ model: Doctor, as: "doctors", attributes: ["prefix"] }] }]
        }
        const hrBilling = {
          model: PatientBilling, as: "hrBilling", required: false, attributes: ["id", "particulars", "amount"]
        }
        const labTestPatient = {
          model: PatientSuggestedLabtest, as: "patient_suggested_labtest", required: false, attributes: ["id", "lab_test_id"],
          include: [
            { model: LabTest, as: "labtestData", required: false, attributes: ["id", "name"], }

          ]
        }

        const queryIncludes = [joindata, transactionData, appointmentDoc, Medicine, suggestTreatment, patientSymptoms, patientDiseases, addonDoctor, prescriptionDoc, hrBilling, labTestPatient]
        query.include.push(...queryIncludes)
      }
      if (data.status == options.appointmentStatus.COMPLETED) {
        const joindata = {
          model: Doctor, as: "doctors", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }, { model: UserReview, as: "doctorReview", required: false, attributes: ["id"] }]
        }
        const transactionData = {
          model: PatientTransactions, as: "patientTransaction", attributes: ["id", "order_number", "payment_method", "amount", "remarks"],
          include: [{
            model: AppointmentOrder, as: "appointmentOrder", attributes: ["sub_total", "discount", "net_total"]
          }]
        }
        const addonDoctor = {
          model: Doctor, as: "addonDoctor", attributes: ["id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }
        const appointmentDoc = {
          model: AppointmentDocument, as: "appointmentDoc", attributes: ["media_type", "media_path"]
        }
        const Medicine = {
          model: PatientMedicine, as: "patientMedicine", required: false, attributes: ["id", "medicine_id", "dose", "duration", "repeat", "day_time", "taken_time"],
          include: [{ model: Medicines, as: "pharmacy", attributes: ["name", "dosage"] }]
        }
        const suggestTreatment = {
          model: PatientTreatment, as: "patientTreatment", required: false, attributes: ["id", "patient_id", "treatment_id"],
          include: [{ model: Treatment, as: "treatmentData", attributes: ["name", "description"] }]
        }
        const patientSymptoms = {
          model: PatientSymptom, as: "patientSymptom", required: false, attributes: ["id", "patient_id", "symptoms_id", "description"],
          include: [{ model: Symptoms, as: "symptoms", attributes: ["name"/* , "description" */] }]
        }
        const patientDiseases = {
          model: PatientDiseases, as: "patientDiseases", required: false, attributes: ["id", "patient_id", "disease_id"],
          include: [{ model: Disease, as: "diseases", attributes: ["name", "description"] }]
        }
        const prescriptionDoc = {
          model: PatientPrescriptionDoc, as: "patientPrescription", required: false, limit: 4, attributes: ["id", "doc_name", "doc_path"],
          // include: [{ model: User, as: "userPreacription", attributes: ["full_name"], include: [{ model: Doctor, as: "doctors", attributes: ["prefix"] }] }]
        }
        const hrBilling = {
          model: PatientBilling, as: "hrBilling", required: false, attributes: ["id", "particulars", "amount"]
        }
        const labTestPatient = {
          model: PatientSuggestedLabtest, as: "patient_suggested_labtest", required: false, attributes: ["id", "lab_test_id"],
          include: [
            { model: LabTest, as: "labtestData", required: false, attributes: ["id", "name"], }

          ]
        }
        const queryIncludes = [joindata, transactionData, addonDoctor, appointmentDoc, Medicine, suggestTreatment, patientSymptoms, patientDiseases, prescriptionDoc, hrBilling, /* labTest, */labTestPatient]
        query.include.push(...queryIncludes)
      }
    }

    if (data.type == "clinic") {
      query.where.appointment_type = options.appointmentType.INCLINIC
      if (data.status == options.appointmentStatus.REQUESTED) {
        const joindata = {
          model: AppointmentRequest, as: "appointmentRequest", attributes: ["clinic_id", "status"], where: { is_addon: false },
          include: [{
            model: Clinic, as: "clinicData", attributes: ["clinic_name", "clinic_type", "clinic_image"]
          }]
        }
        query.include.push(joindata)
      }
      if (data.status == options.appointmentStatus.UPCOMING) {
        const clinic = {
          model: Clinic, as: "clinicdata", attributes: ["id", "clinic_type", "clinic_name", "clinic_image", "location", "latitude", "longitude"]
        }
        const doctorData = {
          model: Doctor, as: "doctors", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }
        const transactionData = {
          model: PatientTransactions, as: "patientTransaction", attributes: ["id", "order_number", "payment_method", "amount", "remarks"],
          include: [{
            model: AppointmentOrder, as: "appointmentOrder", attributes: ["sub_total", "discount", "net_total"]
          }]
        }
        const queryIncludes = [clinic, doctorData, transactionData]
        query.include.push(...queryIncludes)
      }
      if (data.status == options.appointmentStatus.INPROCESS) {
        const clinic = {
          model: Clinic, as: "clinicdata", attributes: ["id", "clinic_type", "clinic_name", "clinic_image", "location", "latitude", "longitude"]
        }
        const doctorData = {
          model: Doctor, as: "doctors", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }
        const appointmentDoc = {
          model: AppointmentDocument, as: "appointmentDoc", attributes: ["media_type", "media_path"]
        }
        const Medicine = {
          model: PatientMedicine, as: "patientMedicine", required: false, attributes: ["id", "medicine_id", "dose", "duration", "repeat", "day_time", "taken_time", "pharmacy_order_id", "createdAt"],
          include: [
            { model: PharmacyOrderDetails, as: "pharmacyOrderDetail", attributes: ["status"] },
            { model: Medicines, as: "pharmacy", attributes: ["name", "dosage"] },
          ]
        }
        const suggestTreatment = {
          model: PatientTreatment, as: "patientTreatment", required: false, attributes: ["id", "patient_id", "treatment_id"],
          include: [{ model: Treatment, as: "treatmentData", attributes: ["name", "description"] }]
        }
        const patientSymptoms = {
          model: PatientSymptom, as: "patientSymptom", required: false, attributes: ["id", "patient_id", "symptoms_id", "description"],
          include: [{ model: Symptoms, as: "symptoms", attributes: ["name"/* , "description" */] }]
        }
        const patientDiseases = {
          model: PatientDiseases, as: "patientDiseases", required: false, attributes: ["id", "patient_id", "disease_id"],
          include: [{ model: Disease, as: "diseases", attributes: ["name", "description"] }]
        }

        const addonDoctor = {
          model: Doctor, as: "addonDoctor", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }

        const prescriptionDoc = {
          model: PatientPrescriptionDoc, as: "patientPrescription", required: false, limit: 4, attributes: ["id", "doc_name", "doc_path"],
          // include: [{ model: User, as: "userPreacription", attributes: ["full_name"], include: [{ model: Doctor, as: "doctors", attributes: ["prefix"] }] }]
        }
        const hrBilling = {
          model: PatientBilling, as: "hrBilling", required: false, attributes: ["id", "particulars", "amount"]
        }
        const labTest = {
          model: LabTestPatients, as: "labtestPatients", required: false, attributes: ["id", "status", "report_path"],
          include: [
            {
              model: LabTestClinics, as: "labtestClinics", required: false, attributes: ["id", "clinic_id"],
              include: [
                { model: Clinic, as: "clinicsLab", required: false, attributes: ["id", "clinic_name"], },
                { model: LabTest, as: "lab_tests", required: false, attributes: ["id", "name"], },
              ]
            }
          ]
        }
        const transactionData = {
          model: PatientTransactions, as: "patientTransaction", attributes: ["id", "order_number", "payment_method", "amount", "remarks"],
          include: [{
            model: AppointmentOrder, as: "appointmentOrder", attributes: ["sub_total", "discount", "net_total"]
          }]
        }
        const queryIncludes = [clinic, doctorData, Medicine, suggestTreatment, patientSymptoms, patientDiseases, appointmentDoc, addonDoctor, prescriptionDoc, hrBilling, labTest, transactionData]
        query.include.push(...queryIncludes)
      }
      if (data.status == options.appointmentStatus.COMPLETED) {
        const clinic = {
          model: Clinic, as: "clinicdata", attributes: ["id", "clinic_type", "clinic_name", "clinic_image", "location", "latitude", "longitude"]
        }
        const doctorData = {
          model: Doctor, as: "doctors", attributes: ["id", "user_id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }
        const addonDoctor = {
          model: Doctor, as: "addonDoctor", attributes: ["id", "doctor_type", "prefix", "experience", "rating_point"],
          include: [{
            model: User, as: "users", attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["pincode", "gender", "address1"], }
            ]
          }]
        }
        const appointmentDoc = {
          model: AppointmentDocument, as: "appointmentDoc", attributes: ["media_type", "media_path"]
        }
        const Medicine = {
          model: PatientMedicine, as: "patientMedicine", required: false, attributes: ["id", "medicine_id", "dose", "duration", "repeat", "day_time", "taken_time"],
          include: [{ model: Medicines, as: "pharmacy", attributes: ["name", "dosage"] }]
        }
        const suggestTreatment = {
          model: PatientTreatment, as: "patientTreatment", required: false, attributes: ["id", "patient_id", "treatment_id"],
          include: [{ model: Treatment, as: "treatmentData", attributes: ["name", "description"] }]
        }
        const patientSymptoms = {
          model: PatientSymptom, as: "patientSymptom", required: false, attributes: ["id", "patient_id", "symptoms_id", "description"],
          include: [{ model: Symptoms, as: "symptoms", attributes: ["name"/* , "description" */] }]
        }
        const patientDiseases = {
          model: PatientDiseases, as: "patientDiseases", required: false, attributes: ["id", "patient_id", "disease_id"],
          include: [{ model: Disease, as: "diseases", attributes: ["name", "description"] }]
        }
        const prescriptionDoc = {
          model: PatientPrescriptionDoc, as: "patientPrescription", required: false, limit: 4, attributes: ["id", "doc_name", "doc_path"],
          // include: [{ model: User, as: "userPreacription", attributes: ["full_name"], include: [{ model: Doctor, as: "doctors", attributes: ["prefix"] }] }]
        }
        const hrBilling = {
          model: PatientBilling, as: "hrBilling", required: false, attributes: ["id", "particulars", "amount"]
        }
        const labTest = {
          model: LabTestPatients, as: "labtestPatients", required: false, attributes: ["id", "status", "report_path"],
          include: [
            {
              model: LabTestClinics, as: "labtestClinics", required: false, attributes: ["id", "clinic_id"],
              include: [
                { model: Clinic, as: "clinicsLab", required: false, attributes: ["id", "clinic_name"], },
                { model: LabTest, as: "lab_tests", required: false, attributes: ["id", "name"], },
              ]
            }
          ]
        }
        const transactionData = {
          model: PatientTransactions, as: "patientTransaction", attributes: ["id", "order_number", "payment_method", "amount", "remarks"],
          include: [{
            model: AppointmentOrder, as: "appointmentOrder", attributes: ["sub_total", "discount", "net_total"]
          }]
        }
        const queryIncludes = [clinic, doctorData, addonDoctor, Medicine, suggestTreatment, patientSymptoms, patientDiseases, appointmentDoc, prescriptionDoc, hrBilling, labTest, transactionData]
        query.include.push(...queryIncludes)
      }
    }

    const appointment = await commonServices.get(Appointment, query)
    let response = JSON.parse(JSON.stringify(appointment))
    if (data.type == "online" && data.status !== options.appointmentStatus.REQUESTED) {
      response.doctors.doctorReview = response.doctors.doctorReview.length
    }
    return response
  },
  sendAddOnRequest: async (req, data) => {
    const t = await db.sequelize.transaction();
    try {
      const addOnRequest = await commonServices.update(Appointment, { where: { id: data.appointmentId } },
        {
          is_addon: 1,
          addon_status: options.appointmentStatus.REQUESTED
        }, { transaction: t })
      if (!addOnRequest) {
        await t.rollback()
        return false
      }
      const newReqBody = []
      const addOnDoctorReq = (params) => {
        newReqBody.push({
          ...params,
          appointment_id: parseInt(data.appointmentId),
          patient_id: data.patientId,
          appointment_type: data.appointment_type,
          status: options.appointmentStatus.REQUESTED,
          slot_timing: data.slot_timing,
          treatment_id: data.treatment_id,
          speciality_id: data.speciality_id,
          is_addon: true,
          addon_status: options.appointmentStatus.REQUESTED,
          createdBy: data.userId
        })
      }
      if (data.doctor_id.length != 0) {
        if (data.doctor_id.length > options.appointmentLimit.DOCTOR_SELECTION) {
          return res.status(200).json({ success: "false", message: message.REQUEST_LIMIT("consultation", options.appointmentLimit.DOCTOR_SELECTION) })
        }
        for (const doctorId of data.doctor_id) {
          addOnDoctorReq({ doctor_id: doctorId });
        }
      }
      const consultationReq = await commonServices.bulkCreate(AppointmentRequest, newReqBody, { transaction: t })
      await t.commit()
      return consultationReq
    } catch (error) {
      await t.rollback();
      return false
    }
  },
  getAllAddOnDoctors: async (data) => {
    let arr1 = []
    var doctorSpeciality = await commonServices.getAll(DoctorSpeciality, { where: { speciality_id: data.speciality }, attributes: ["id", "doctor_id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"] }] })
    doctorSpeciality.length != 0 && doctorSpeciality.map(i => { arr1.push(i.doctor_id) })
    let arr2 = []
    const doctorTime = await commonServices.getAll(DoctorTiming, {
      attributes: ["doctor_id", "day_of_week", "session_start_time", "session_end_time"],
      where: { consultation: true }
    })
    doctorTime.length != 0 && doctorTime.map(i => { arr2.push(i.doctor_id) })
    const idArr = arr1.filter(id => arr2.includes(id));
    var doctorIdArr = _.remove(idArr, function (n) {
      return n != data.doctorId
    })
    const doctor = await commonServices.getAndCountAll(Doctor, {
      where: { status: options.DoctorStatus.APPROVE, user_id: { [Op.ne]: data.userId }, id: doctorIdArr },
      attributes: ["id", "user_id", "prefix", "doctor_type", "bio", "experience", "known_language", "consultation_fees", "createdAt"],
      include: [
        { model: User, as: "users", attributes: ["full_name", "slug", "profile_image"] },
        { model: DoctorEducation, as: "doctor_educations", attributes: ["year"], include: [{ model: Degree, as: "degrees", attributes: ["name"] }] },
        { model: DoctorTiming, as: "doctor_timing", attributes: ["day_of_week", "session_start_time", "session_end_time"] },
        {
          model: DoctorSpeciality, as: "doctor_specialities", attributes: ["id"],
          include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], }]
        },
        { model: DoctorAchievement, as: "doctorAchievement", required: false, attributes: ["name"] },
        { model: ClinicDoctorRelation, as: "clinic_doctor_relations", required: true, include: [{ model: Clinic, as: "clinics", attributes: ["clinic_name"] }] }
      ],
      distinct: true
    }, data.limit, data.offset)
    return doctor
  },
  getAllPrescriptionDocument: async (data) => {
    const prescriptionDoc = await commonServices.getAll(PatientPrescriptionDoc, {
      where: { patient_id: data.patientId },
      attributes: ["id", "doc_name", "doc_path", "createdAt"],
      include: [{ model: User, as: "userPreacription", attributes: ["full_name"], include: [{ model: Doctor, as: "doctors", attributes: ["prefix"] }] }]
    })
    const resposne = JSON.parse(JSON.stringify(prescriptionDoc))
    const obj = resposne.map(i => {
      return {
        id: i.id,
        doc_name: i.doc_name,
        doc_path: i.doc_path,
        createdAt: i.createdAt,
        uploadBy: `${i.userPreacription.doctors.prefix} ${i.userPreacription.full_name}`
      }
    })
    return obj
  },
  viewPrescriptionDocumentById: async (data) => {
    const prescriptionDocument = await commonServices.get(PatientPrescriptionDoc, {
      where: { id: data.docId }, attributes: ["id", "doc_name", "doc_path"],
      include: [{
        model: Doctor, as: "referralDoctor", attributes: ["id", "prefix", "doctor_type"],
        include: [{ model: User, as: "users", attributes: ["full_name", "phone_no"] }]
      }, { model: Appointment, as: "appointmentInfo", attributes: ["id", "doctor_notes", "problem_info"] }]
    })
    const patientSymptoms = await commonServices.checkFlag(PatientSymptom, { where: { appointment_id: prescriptionDocument.appointmentInfo.id } })

    const response = Object.assign({}, {
      id: prescriptionDocument.id,
      doc_name: prescriptionDocument.doc_name,
      doc_path: prescriptionDocument.doc_path,
      full_name: `${prescriptionDocument.referralDoctor.prefix} ${prescriptionDocument.referralDoctor.users.full_name}`,
      doctor_type: prescriptionDocument.referralDoctor.doctor_type,
      phone_no: prescriptionDocument.referralDoctor.users.phone_no,
      problem_info: prescriptionDocument.appointmentInfo.problem_info,
      doctor_notes: prescriptionDocument.appointmentInfo.doctor_notes,
      symptoms: patientSymptoms
    })
    return response
  },
  viewAppointmentPastHistory: async (data) => {
    const query = {
      where: { user_id: data.userId, status: options.appointmentStatus.COMPLETED },
      attributes: ['id', 'doctor_id', 'problem_info', 'doctor_notes', 'patient_id', 'clinic_id', 'createdAt', 'status', 'treatment_id'],
      include: [
        {
          model: Doctor, as: "doctors", attributes: ["id"],
          include: [{ model: User, as: "users", attributes: ["slug", "full_name", "profile_image"] }]
        },
        {
          model: Clinic, as: "clinicdata", attributes: ["id", "clinic_name"]
        },
      ],
      order: [['createdAt', 'ASC']]
    }
    const user = await commonServices.getAll(Appointment, query);
    return user
  },
  acceptAndDeclainAppointmentReq: async (res, data) => {
    try {
      if (data.status == "decline") {
        if (data.isAddon == false) {
          await commonServices.update(AppointmentRequest, { where: { id: data.appointmentReqId } }, { status: options.appointmentStatus.DECLINE, updatedBy: data.userId })

          // for push notification -----------
          const user = await commonServices.get(AppointmentRequest, { where: { id: data.appointmentReqId } });
          const userPatientId = user.patient_id
          const userData = await commonServices.get(Patients, { where: { id: userPatientId } });
          const userId = userData.user_id;
          const payload = fcmNotificationPayload.acceptAndDeclineAppointmentRequest({ userId: userId, body: data.status, })
          await sendAllNotification.sendAllNotification({ payload })
          return true
        }

        if (data.isAddon == true) {
          await commonServices.update(AppointmentRequest, { where: { id: data.appointmentReqId } }, { addon_status: options.appointmentStatus.DECLINE, updatedBy: data.userId })

          // for push notification -----------
          const user = await commonServices.get(AppointmentRequest, { where: { id: data.appointmentReqId } });
          const userPatientId = user.patient_id
          const userData = await commonServices.get(Patients, { where: { id: userPatientId } });
          const userId = userData.user_id;
          const payload = fcmNotificationPayload.acceptAndDeclineAppointmentRequest({ userId: userId, body: data.status })
          await sendAllNotification.sendAllNotification({ payload })
          return true
        }
      }

      if (data.status == "accept") {
        if (data.isAddon == false) {

          const t = await db.sequelize.transaction();
          try {
            const userReq = await commonServices.update(AppointmentRequest, { where: { id: data.appointmentReqId, is_addon: false } }, { status: options.appointmentStatus.UPCOMING, doctor_id: data.doctorId, updatedBy: data.userId }, { transaction: t })
            if (userReq[0] == 0) {
              await t.rollback()
              return false
            }

            await commonServices.update(AppointmentRequest, { where: { appointment_id: data.appoitmentId, id: { [Op.ne]: data.appointmentReqId } } }, { status: options.appointmentStatus.CANCELLED, updatedBy: data.patientUserId, cancelledBy: data.patientUserId }, { transaction: t })

            const appointmentData = await commonServices.update(Appointments, { where: { id: data.appoitmentId } }, { clinic_id: data.clinicId || null, doctor_id: data.doctorId, status: options.appointmentStatus.UPCOMING, updatedBy: data.userId }, { transaction: t })
            if (appointmentData[0] == 0) {
              await t.rollback()
              return false
            }
            await commonServices.update(JitsiRoom, { where: { appointment_id: data.appoitmentId } }, { doctor_id: data.doctorId }, { transaction: t })
            await t.commit();

            // for push notification -----------
            const user = await commonServices.get(AppointmentRequest, { where: { id: data.appointmentReqId } });
            const userPatientId = user.patient_id
            const userData = await commonServices.get(Patients, { where: { id: userPatientId } });
            const userId = userData.user_id;
            const payload = fcmNotificationPayload.acceptAndDeclineAppointmentRequest({ userId: userId, body: 'accepted' })
            await sendAllNotification.sendAllNotification({ payload })
            return true

          } catch (error) {
            await t.rollback();
            res.status(200).json({ success: "false", message: error.message })
          }
        }

        if (data.isAddon == true) {
          const t = await db.sequelize.transaction();
          try {
            const userReq = await commonServices.update(AppointmentRequest, { where: { id: data.appointmentReqId, is_addon: true } }, { addon_status: options.appointmentStatus.UPCOMING, updatedBy: data.userId }, { transaction: t })
            if (userReq[0] == 0) {
              await t.rollback()
              return false
            }
            await commonServices.update(AppointmentRequest, { where: { appointment_id: data.appoitmentId, is_addon: true, id: { [Op.ne]: data.appointmentReqId } } }, { addon_status: options.appointmentStatus.CANCELLED, updatedBy: data.patientUserId, cancelledBy: data.patientUserId }, { transaction: t })

            const obj = {
              addon_doctor_id: data.doctorId,
              addon_status: options.appointmentStatus.UPCOMING,
              updatedBy: data.userId
            }
            const user = await commonServices.update(Appointments, { where: { id: data.appoitmentId, is_addon: true } }, obj, { transaction: t })
            if (user[0] == 0) {
              await t.rollback()
              return false
            }

            await t.commit();
            // for push notification -----------
            const userRequestData = await commonServices.get(AppointmentRequest, { where: { id: data.appointmentReqId } });
            const userPatientId = userRequestData.patient_id;
            const userData = await commonServices.get(Patients, { where: { id: userPatientId } });
            const userId = userData.user_id;
            const payload = fcmNotificationPayload.acceptAndDeclineAppointmentRequest({ userId: 363, body: 'accepted' })
            await sendAllNotification.sendAllNotification({ payload })
            return true

          } catch (error) {
            await t.rollback();
            res.status(200).json({ success: "false", message: error.message })
          }
        }
      }
    } catch (error) {
      res.status(200).json({ success: "false", message: error.message })
    }
  },
  addHrBilling: async (res, data) => {
    try {
      const obj = {
        appointment_id: data.appointmentId,
        patient_id: data.patientId,
        particulars: data.particulars,
        amount: data.amount,
        createdBy: data.userId,
      }
      const outputData = await commonServices.create(PatientBilling, obj)
      return outputData
    } catch (error) {
      res.status(200).json({ success: "false", message: error.message })
    }
  },
  addPaymentHistory: async (res, data) => {
    try {
      const t = await db.sequelize.transaction();
      try {
        const obj = {
          user_id: data.patientUserId,
          appointment_id: data.appointment_id,
          payment_method: options.paymentMethod.CASH,
          payment_type: data.payment_type,
          amount: data.amount,
          order_number: commonServices.generateOrderId(14),
          remarks: data.remarks,
          status: options.appointmentPaymentStatus.SUCCESS,
          txn_id: commonServices.generateUniqueId(12),
          patient_insurance_id: data.patient_insurance_id || null,
          createdBy: data.userId
        }
        const transaction = await commonServices.create(PatientTransactions, obj, { transaction: t })
        if (!transaction) {
          await t.rollback();
          return false
        }

        const transactionObj = {
          user_id: data.patientUserId,
          order_id: transaction.order_number,
          payment_id: commonServices.generatePaymentId(14),
          payment_method: options.paymentMethod.CASH,
          payment_type: options.paymentType.CREDIT,
          request_type: null,
          txn_type: options.txnType.APPOINTMENT,
          amount: data.amount,
          status: options.appointmentPaymentStatus.SUCCESS,
          remarks: data.remarks,
          txn_id: transaction.txn_id,
          createdBy: data.userId
        }
        const transactionData = await commonServices.create(Transactions, transactionObj, { transaction: t })
        if (!transactionData) {
          await t.rollback();
          return false
        }

        await t.commit();
        return true

      } catch (error) {
        console.log(error);
        await t.rollback();
        res.status(200).json({ success: "false2", message: error.message })
      }

    } catch (error) {
      res.status(200).json({ success: "false", message: error.message })
    }
  },
  deletePaymentHistory: async (data) => {
    try {
      const t = await db.sequelize.transaction();
      try {
        const transaction = await commonServices.delete(PatientTransactions, { where: { id: data.id } }, { transaction: t })
        if (!transaction) {
          await t.rollback();
          return false
        }

        const transactionData = await commonServices.delete(Transactions, { where: [{ order_id: data.orderNumber }, { user_id: data.userId }, { payment_method: options.paymentMethod.CASH }] }, { transaction: t })
        if (!transactionData) {
          await t.rollback();
          return false
        }

        await t.commit();
        return true

      } catch (error) {
        console.log(error);
        await t.rollback();
        return false
      }

    } catch (error) {
      console.log(error);
      return false
    }
  },
  getOpdIpdList: async (data) => {
    try {

      let ts = Date.now();
      let date_ob = new Date(ts);
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      let day = date_ob.getDay();
      const dateTime = hours + ":" + minutes + ":" + seconds;

      const allDoctor = await commonServices.getAll(ClinicDoctorRelation, { where: { clinic_id: data.clinicId } })
      const doctorArr = []
      allDoctor.map(i => {
        doctorArr.push(i.doctor_id)
      })

      const timingQuery = {
        where: [
          { doctor_id: { [Op.or]: [doctorArr] } },
          { session_start_time: { [Op.lte]: [dateTime] } },
          { session_end_time: { [Op.gte]: [dateTime] } },
          { day_of_week: day }
        ]
      }
      const doctorAvailable = await commonServices.getAll(DoctorTiming, timingQuery)
      const totalDoctor = doctorAvailable.length


      let DataObj = {};
      if (data.s) {
        DataObj = {
          ...DataObj,
          [Op.or]: [
            { "$patients.full_name$": { [Op.like]: `%${data.s}%` } },
          ]
        }
      }


      const query = {
        where: [DataObj, { clinic_id: data.clinicId }],
        attributes: ['id', 'appointment_id', 'patient_id', 'status', 'createdAt'],
        include: [
          {
            model: Patients, as: 'patients', attributes: ['user_id', 'unique_id', 'full_name', 'gender', 'age'],
            include: [
              { model: User, as: 'usersData', attributes: ['slug', 'profile_image'], }
            ]
          },
          {
            model: Doctor, as: 'doctors', required: false, attributes: ['id', 'user_id', 'prefix', 'doctor_type'],
            include: [{
              model: User, as: "users", required: false, attributes: ["id", "full_name", "profile_image", "countryCode", "phone_no", "email"],
              include: [
                { model: UserDetails, as: "user_details", required: false, attributes: ["pincode", "gender", "address1"], }
              ]
            }]
          }
        ]
      };

      const countPatientQuery = {
        where: [{ clinic_id: data.clinicId, }],
        group: ["patient_id"]
      }

      if (data.status == "opd") {
        const queryData = {
          status: { [Op.or]: [/* options.appointmentStatus.REQUESTED,  */options.appointmentStatus.UPCOMING] }
        }
        query.where.push(queryData);

        const countPatientQueryData = {
          type: options.appointmentType.OPD
        }
        countPatientQuery.where.push(countPatientQueryData);
      }

      if (data.status == "ipd") {
        const queryData = {
          status: { [Op.or]: [options.appointmentStatus.INPROCESS] }
        }
        query.where.push(queryData);

        const countPatientQueryData = {
          type: options.appointmentType.IPD
        }
        countPatientQuery.where.push(countPatientQueryData);
      }

      const countPatient = await commonServices.getAll(Appointment, countPatientQuery)
      const totalPatient = countPatient.length;

      const { limit, offset } = commonServices.getPagination(data.length, data.size)
      const responseData = await commonServices.getAndCountAll(AppointmentRequest, query, limit, offset)
      const getPagingData = commonServices.getPagingData(responseData, data.page, limit)
      const response = JSON.parse(JSON.stringify(getPagingData))

      if (data.status == "opd") {
        var obj = {
          totalItems: response.totalItems,
          availableDoctors: totalDoctor,
          totalPatient: totalPatient,
          data: response.data,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
        }
      }

      if (data.status == "ipd") {
        const getAllBeds = await commonServices.getAll(Beds, { where: { clinic_id: data.clinicId } })
        const bedsArr = []
        getAllBeds.map(i => {
          bedsArr.push(i.id)
        })

        const getAllOccupiedBeds = await commonServices.getAll(AssignBeds, { where: { bed_id: { [Op.or]: [bedsArr] } } })

        const totalBeds = getAllBeds.length;
        const occupiedBeds = getAllOccupiedBeds.length;

        var obj = {
          totalItems: response.totalItems,
          totalBeds: totalBeds,
          occupiedBeds: occupiedBeds,
          totalPatient: totalPatient,
          data: response.data,
          totalPages: response.totalPages,
          currentPage: response.currentPage,
        }
      }

      return obj

    } catch (error) {
      return error
    }
  },
  getPatientHealthRecoards: async (data) => {
    try {

      let ts = Date.now();
      let date_ob = new Date(ts);
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      let day = date_ob.getDay();
      const dateTime = hours + ":" + minutes + ":" + seconds;

      const allDoctor = await commonServices.getAll(ClinicDoctorRelation, { where: { clinic_id: data.clinicId } })
      const doctorArr = []
      allDoctor.map(i => {
        doctorArr.push(i.doctor_id)
      })

      const timingQuery = {
        where: [
          { doctor_id: { [Op.or]: [doctorArr] } },
          { session_start_time: { [Op.lte]: [dateTime] } },
          { session_end_time: { [Op.gte]: [dateTime] } },
          { day_of_week: day }
        ]
      }
      const doctorAvailable = await commonServices.getAll(DoctorTiming, timingQuery)
      const totalDoctor = doctorAvailable.length


      let DataObj = {};
      if (data.s) {
        DataObj = {
          ...DataObj,
          [Op.or]: [
            { "$patients.full_name$": { [Op.like]: `%${data.s}%` } },
          ]
        }
      }


      const query = {
        where: [DataObj, { clinic_id: data.clinicId }, { status: { [Op.or]: [options.appointmentStatus.INPROCESS, options.appointmentStatus.COMPLETED] } }],
        attributes: ['id', 'appointment_id', 'patient_id', 'status', 'createdAt'],
        include: [
          {
            model: Patients, as: 'patients', attributes: ['user_id', 'unique_id', 'full_name', 'gender', 'age'],
            include: [
              { model: User, as: 'usersData', attributes: ['slug', 'profile_image'], }
            ]
          }
        ]
      };



      const { limit, offset } = commonServices.getPagination(data.length, data.size)
      const responseData = await commonServices.getAndCountAll(AppointmentRequest, query, limit, offset)
      const getPagingData = commonServices.getPagingData(responseData, data.page, limit)
      const response = JSON.parse(JSON.stringify(getPagingData))


      const getAllBeds = await commonServices.getAll(Beds, { where: { clinic_id: data.clinicId } })
      const bedsArr = []
      getAllBeds.map(i => {
        bedsArr.push(i.id)
      })

      const getAllOccupiedBeds = await commonServices.getAll(AssignBeds, { where: { bed_id: { [Op.or]: [bedsArr] } } })

      const totalBeds = getAllBeds.length;
      const occupiedBeds = getAllOccupiedBeds.length;

      var obj = {
        totalItems: response.totalItems,
        totalBeds: totalBeds,
        occupiedBeds: occupiedBeds,
        data: response.data,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      }


      return obj

    } catch (error) {
      return error
    }
  },
  count5StartRating: async (existId) => {
    try {
      const ratingData = await commonServices.getAll(UserReview,
        {
          where: { ...existId },
          attributes: ["rating_point", [Sequelize.fn('COUNT', Sequelize.col('rating_point')), 'rating_count']], group: ['rating_point'],
          raw: true
        })
      if (ratingData.length !== 0) {
        const totalRatingCount = ratingData.reduce((total, rating) => total + rating.rating_count, 0);
        const totalRatingScore = ratingData.reduce((total, rating) => total + (rating.rating_point * rating.rating_count), 0);
        const score = (totalRatingScore / totalRatingCount).toFixed(1)
        return score
      } else {
        return score = 0
      }
    } catch (error) {
      throw error
    }
  },
  createPatientTransaction: async (data) => {
    try {
      const patientTransaction = await commonServices.create(PatientTransactions, {
        user_id: data.userId,
        appointment_id: data.appointment_id,
        order_number: data.order_number || `order_${commonServices.generateUniqueId(14)}`,
        payment_method: data.paymentMethod,
        payment_type: data.paymentType,
        amount: data.amount,
        status: options.transactionStatus.SUCCESS,
        remarks: data.remarks || message.TRANSACTION_SUCCESS("The payment"),
        txn_id: data.txn_id,
        createdBy: data.userId,
        updatedBy: data.userId
      })
      return patientTransaction;
    } catch (error) {
      return error
    }
  },
  createAppointmentOrder: async (req, data) => {
    try {
      const orderData = await commonServices.create(AppointmentOrder, {
        user_id: data.userId,
        order_number: data.orderId,
        payment_method: req.query.method,
        payment_type: options.paymentType.DEBIT,
        txn_type: data.txn_type,
        sub_total: data.sub_total,
        discount: data.discount,
        net_total: data.net_total,
        createdBy: data.userId,
        ...req.body,
      })
      return orderData
    } catch (error) {
      console.log(error)
      return error
    }
  },
  bookLabAppointment: async (req, res, userId, patientId, clinic_id) => {
    const t = await db.sequelize.transaction();
    try {
      const labAppointment = await commonServices.create(Appointment, {
        appointment_type: req.body.appointment_type,
        user_id: userId,
        patient_id: patientId,
        doctor_id: null,
        clinic_id: clinic_id,
        status: options.appointmentStatus.REQUESTED,
        slot_timing: req.body.slot_timing,
        problem_info: null,
        treatment_id: null,
        speciality_id: null,
        lab_test_id: req.body.lab_test_id,
        createdBy: userId,
      }, { transaction: t })
      if (!labAppointment) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Lab appointment request") })
      }
      const labRequestAppointment = await commonServices.create(AppointmentRequest, {
        appointment_id: labAppointment.id,
        doctor_id: null,
        patient_id: patientId,
        appointment_type: req.body.appointment_type,
        clinic_id: clinic_id,
        status: options.appointmentStatus.REQUESTED,
        slot_timing: req.body.slot_timing,
        treatment_id: null,
        speciality_id: null,
        lab_test_id: req.body.lab_test_id,
        createdBy: userId,
      }, { transaction: t })

      if (!labRequestAppointment) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Lab appointment request") })
      }
      await t.commit()
      return labAppointment;
    } catch (error) {
      console.log(error);
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
  },
}

module.exports = { consultationExist, methods, labAppointmentExist }
