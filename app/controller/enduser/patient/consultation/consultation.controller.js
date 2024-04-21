const db = require("../../../../models");
const { Sequelize } = require("../../../../models");
const moment = require("moment");
const _ = require("lodash");
const axios = require("axios");
const OpenAI = require("openai");
const fs = require("fs");
const { methods: commonServices, getUsedRate, getConsultationFee } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content");
const { methods: consultationServices, consultationExist } = require("../../../../services/consultation");
const commonResponse = require("./common.response");
const commonConsultService = require("./service");
const message = require("../../message");
const options = require('../../../../config/options');
const { methods: ecommerceService } = require("../../../../services/ecommerce")
const commonConfig = require("../../../../config/common.config")
const Op = db.Sequelize.Op;

const Clinic = db.clinics;
const AppointmentRequest = db.appointment_requests;
const Appointment = db.appointments;
const Doctor = db.doctors;
const Degree = db.degrees
const User = db.users;
const Beds = db.beds;
const Patient = db.patients;
const DoctorSpeciality = db.doctor_specialities;
const DoctorTiming = db.doctor_timings;
const DoctorEducation = db.doctor_educations;
const Speciality = db.specialities;
const Treatment = db.treatments;
const PatientTransaction = db.patient_transactions;
const DoctorAchievement = db.doctor_achievements;
const ClinicDoctorRelation = db.clinic_doctor_relations;
const ClinicSpeciality = db.clinic_specialities;
const ClinicTiming = db.clinic_timings;
const ClinicFacility = db.clinic_facilities;
const Facility = db.facilities;
const UserReview = db.user_reviews;
const Pharmacy = db.pharmacies;
const Transaction = db.transactions;
const Setting = db.settings;
const Promocode = db.promocods;
const AppointmentSummaries = db.appointment_summaries;



exports.getAllSpecialityAndTreatment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { s } = req.query
    var searchData = {};
    var treatmentSearch = {}
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } },
          Sequelize.literal(`JSON_UNQUOTE(\`specialities\`.\`keywords\`) LIKE "%${s}%"`),
          Sequelize.literal(`JSON_UNQUOTE(\`specialities\`.\`alternative_name\`) LIKE "%${s}%"`),
          // consultationServices.addAllLanguageSearch("keywords", s),
          // consultationServices.addAllLanguageSearch("alternative_name", s)
        ]
      }
      treatmentSearch = {
        ...treatmentSearch,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } }
        ]
      }
    }
    const [speciality, treatment] = await Promise.all([
      await consultationServices.getAllSpecialities({
        where: { is_active: true, ...searchData },
        attributes: ["id", "name", "image_path", "keywords", "alternative_name"],
        order: [['createdAt', 'DESC']]
      }),
      await consultationServices.getAllTreatments({
        where: { is_active: true, ...treatmentSearch },
        attributes: ["id", "name", "image_path"],
        order: [['createdAt', 'DESC']],
        include: [{ model: Speciality, as: "specialitydata", attributes: ["id", "name"] }]
      })
    ])
    return res.status(200).json({ success: "true", message: message.GET_LIST("Speciality and treatment"), data: { speciality: speciality, treatment: treatment } })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get all speciality
exports.getAllSpecialities = async (req, res) => {
  const userId = req.user.id;
  try {
    const { page, size, s } = req.query
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } },
          Sequelize.literal(`JSON_UNQUOTE(\`specialities\`.\`keywords\`) LIKE "%${s}%"`),
          Sequelize.literal(`JSON_UNQUOTE(\`specialities\`.\`alternative_name\`) LIKE "%${s}%"`),
          // consultationServices.addAllLanguageSearch("keywords", s),
          // consultationServices.addAllLanguageSearch("alternative_name", s)
        ]
      }
    }
    const query = {
      where: { ...searchData },
      attributes: ["id", "name", "image_path", "keywords", "alternative_name"],
      order: [["id", "DESC"]]
    }
    const speciality = await consultationServices.getAllSpecialities(query, page, size)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Speciality"), data: speciality })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get all treatment
exports.getAllTreatment = async (req, res) => {
  const userId = req.user.id;
  try {
    const { page, size, s } = req.query
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } }
        ]
      }
    }
    const query = {
      where: { ...searchData },
      attributes: ["id", "name", "image_path"],
      order: [["id", "DESC"]],
      include: [{ model: Speciality, as: "specialitydata", attributes: ["id", "name"] }]
    }
    const treatment = await consultationServices.getAllTreatments(query, page, size)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Treatment"), data: treatment })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get doctor list
exports.getDoctorList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { time, day, speciality, page, size, s, gender, experience, satisfyPatient } = req.query;

    const { limit, offset } = commonServices.getPagination(page, size);
    const doctor = await consultationServices.getAllConsultantDoctors({ userId, time, day, speciality, limit, offset, s, gender, experience, satisfyPatient })
    const responseData = commonServices.getPagingData(doctor, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor list") })
    }
    const doctorRes = commonResponse.modifyDoctorProfile(response.data)
    const promises = doctorRes.map(async (doctorData) => {
      const totalAppointment = await commonServices.getAll(Appointment, {
        where: { doctor_id: doctorData.id, status: options.appointmentStatus.COMPLETED },
        group: ["patient_id"]
      });

      const totalCase = await commonServices.getAll(Appointment, {
        where: { doctor_id: doctorData.id, status: options.appointmentStatus.COMPLETED },
      });

      doctorData.totalAppointment = totalAppointment.length; // Total unique patients
      doctorData.totalCase = totalCase.length; // Total cases
      return doctorData;
    });

    const doctorsWithData = await Promise.all(promises);
    const modifyRes = {
      totalItems: response.totalItems,
      data: doctorsWithData,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Doctor"), data: modifyRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view doctor by id
exports.viewDoctorById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slug } = req.params
    const userData = await commonServices.get(User, { where: { slug: slug } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const doctorData = await commonServices.get(Doctor,
      {
        where: { user_id: userData.id },
        attributes: ["id", "user_id", "doctor_type", "bio", "prefix", "experience", "known_language", "consultation_fees", "rating_point", "createdAt",
        ],
        include: [
          { model: User, as: "users", attributes: ["full_name", "slug", "profile_image"] },
          { model: DoctorEducation, as: "doctor_educations", attributes: ["year"], include: [{ model: Degree, as: "degrees", attributes: ["name"] }] },
          {
            model: DoctorTiming, as: "doctor_timing", attributes: ["day_of_week", "session_start_time", "session_end_time"],
            where: { consultation: true }
          },
          { model: DoctorSpeciality, as: "doctor_specialities", attributes: ["id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"] }] },
          { model: DoctorAchievement, as: "doctorAchievement", required: false, attributes: ["name"] },
          { model: ClinicDoctorRelation, as: "clinic_doctor_relations", required: true, include: [{ model: Clinic, as: "clinics", attributes: ["clinic_name"] }] },
          { model: UserReview, as: "doctorReview", required: false, attributes: ["id"] }
        ],
      })
    if (!doctorData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const totalAppointment = await commonServices.getAll(Appointment, {
      where: { doctor_id: doctorData.id, status: options.appointmentStatus.COMPLETED },
      group: ["patient_id"]
    })
    const totalCase = await commonServices.getAll(Appointment, {
      where: { doctor_id: doctorData.id, status: options.appointmentStatus.COMPLETED },
    })
    const doctorRes = commonResponse.modifyDoctorProfile([doctorData])
    let doctorDetail = doctorRes[0]
    doctorDetail.totalCase = totalCase.length
    doctorDetail.totalPatient = totalAppointment.length
    return res.status(200).json({ success: "true", message: message.GET_PROFILE("Doctor"), data: doctorDetail })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get hospital list
exports.getHospitalList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { time, day, speciality, page, size, s } = req.query;
    const { limit, offset } = commonServices.getPagination(page, size);
    const clinic = await consultationServices.getAllClinics({ time, day, speciality, limit, offset })
    const responseData = commonServices.getPagingData(clinic, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic list") })
    }
    const clinicRes = commonResponse.modifyClinicProfile(response.data)
    const promises = clinicRes.map(async (clinic_data) => {
      const totalAppointment = await commonServices.getAll(Appointment, {
        where: { clinic_id: clinic_data.id, status: options.appointmentStatus.COMPLETED },
        group: ["patient_id"]
      });

      const totalCase = await commonServices.getAll(Appointment, {
        where: { clinic_id: clinic_data.id, status: options.appointmentStatus.COMPLETED },
      });

      clinic_data.totalAppointment = totalAppointment.length; // Total unique patients
      clinic_data.totalCase = totalCase.length; // Total cases
      return clinic_data;
    });

    const allClinicArr = await Promise.all(promises);
    const modifyRes = {
      totalItems: response.totalItems,
      data: allClinicArr,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Clinic"), data: modifyRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view hospital by id
exports.viewHospitalById = async (req, res) => {
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
        attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_phone_number", "rating_point", "address", "pincode", "bio", "service_24X7", "equipments", "consultation_fees", "clinic_image", "has_NABH", "NABH_certificate_path", "has_iso", "iso_certificate_path", "has_lab", "createdAt"],
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
      })
    if (!clinicData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
    }
    const totalAppointment = await commonServices.getAll(Appointment, {
      where: { clinic_id: clinicData.id, status: options.appointmentStatus.COMPLETED },
      group: ["patient_id"]
    });

    const totalCase = await commonServices.getAll(Appointment, {
      where: { clinic_id: clinicData.id, status: options.appointmentStatus.COMPLETED },
    });
    const clinicRes = commonResponse.modifyClinicProfile([clinicData])
    let clinicDetails = clinicRes[0]
    clinicDetails.totalCase = totalCase.length
    clinicDetails.totalPatient = totalAppointment.length
    return res.status(200).json({ success: "true", message: message.GET_PROFILE("Clinic"), data: clinicDetails })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get promocode list
exports.getPromocodeList = async (req, res) => {
  const userId = req.user.id;
  try {
    const query = {
      attributes: ["id", "name", "description", "percentage", "coupon_code"],
      order: [["id", "DESC"]]
    }
    const promocode = await contentServices.getAllPromocodes(query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Promocode"), data: promocode })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//create appointment payment
exports.createAppointmentPayment = async (req, res) => {
  try {
    const userId = req.user.id
    const { coupon_code } = req.body
    const { method, deviceType } = req.query
    let discountValue = 0
    if (typeof coupon_code === 'string' && coupon_code.length !== 0) {
      const checkCouponNotExist = await ecommerceService.checkCouponApply(res, { coupon_code, userId })
      if (checkCouponNotExist) {
        const checkCouponCode = await commonServices.get(Promocode, { where: { coupon_code: coupon_code, is_active: true } })
        if (!checkCouponCode) {
          return res.status(200).json({ success: "false", message: message.NO_DATA("Coupon Code") })
        }
        discountValue = parseFloat(checkCouponCode.percentage)
      } else {
        return res.status(200).json({ success: "false", message: message.VALIDATE_COUPON })
      }
    }
    const consultationCharge = await getConsultationFee()
    const netTotal = await ecommerceService.calculateConsultationAmount({ discountValue })
    const usdAmount = await getUsedRate()
    const receipt = commonServices.generateUniqueId(20);
    const discount = consultationCharge - netTotal
    if (method == options.paymentMethod.RAZORPAY) {
      const paymentData = await ecommerceService.createRazorPayOrder(netTotal * usdAmount, 'INR', receipt)
      if (!paymentData) {
        return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
      }
      const appointmentOrder = await consultationServices.createAppointmentOrder(req, { sub_total: consultationCharge, discount: discount, net_total: netTotal, txn_type: options.txnType.CONSULTATION, userId, orderId: paymentData.id })
      if (!appointmentOrder) {
        return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
      }
      return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: paymentData })
    }

    if (method == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.WEB) {
        const paymentData = await ecommerceService.createPaypalPayment({ amount: netTotal })
        const appointmentOrder = await consultationServices.createAppointmentOrder(req, { sub_total: consultationCharge, discount: discount, net_total: netTotal, txn_type: options.txnType.CONSULTATION, userId, orderId: `${paymentData.id}` })
        if (!appointmentOrder) {
          return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
        }
        return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: paymentData })
      } else if (deviceType == options.deviceType.APP) {
        const appointmentOrder = await consultationServices.createAppointmentOrder(req, { sub_total: consultationCharge, discount: discount, net_total: netTotal, txn_type: options.txnType.CONSULTATION, userId, orderId: `order_${commonServices.generateUniqueId(14)}` })
        if (!appointmentOrder) {
          return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
        }
        return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: appointmentOrder })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error })
  }
}

//verify appointment payment
exports.verifyAppointmentPayment = async (req, res) => {
  try {
    const userId = req.user.id
    const { paymentId, order_id, method, deviceType } = req.query

    if (method == options.paymentMethod.RAZORPAY) {
      const verifyPayment = await ecommerceService.verifyRazorpayOrder(req, { order_id, payment_id: paymentId })
      if (verifyPayment === true) {
        const ecomTransaction = await ecommerceService.createTransaction({
          userId,
          paymentMethod: method,
          paymentType: options.paymentType.DEBIT,
          txnType: options.txnType.CONSULTATION,
          payment_id: paymentId,
          ...req.body,
          ...req.query
        })
        if (!ecomTransaction) {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        }
        return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
      } else {
        return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
      }
    }
    if (method == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.APP) {
        var verifyPayment = await ecommerceService.verifyMobilePaypalMayment({ paymentId })
        var payment_state = verifyPayment.state;
        var transaction_server = verifyPayment.transactions[0];
        var slale_state_server = transaction_server.related_resources[0].sale.state;

        if (slale_state_server !== "completed") {
          return res.status(200).json({ success: "false", message: message.NO_PAYPAL_SALE })
        }
        if (payment_state !== "approved") {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        } else {
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: method,
            paymentType: options.paymentType.DEBIT,
            txnType: options.txnType.CONSULTATION,
            payment_id: paymentId,
            ...req.body,
            ...req.query
          })
          if (!ecomTransaction) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }
          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        }
      } else if (deviceType == options.deviceType.WEB) {
        var verifyPayment = await ecommerceService.executePaypalPayment({ order_id })
        if (verifyPayment != null) {
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: method,
            paymentType: options.paymentType.DEBIT,
            txnType: options.txnType.CONSULTATION,
            payment_id: paymentId,
            ...req.body,
            ...req.query
          })
          if (!ecomTransaction) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }
          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        } else {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        }
      } else {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Device type") })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//book consultation
exports.bookAppointment = async (req, res) => {
  const userId = req.user.id;
  const patientId = req.body.patient_id || req.user.patients.id
  const doctor_id = req.body.doctor_id || []
  const clinic_id = req.body.clinic_id || []
  try {
    const existData = await consultationExist({
      appointment_type: req.body.appointment_type, userId: userId, patient_id: patientId, slot_timing: req.body.slot_timing,
      treatment_id: req.body.treatment_id || null,
      speciality_id: req.body.speciality_id || null, createdBy: userId
    })
    if (!existData) {
      return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_EXIST("Consultation request") })
    }
    const consultation = await consultationServices.bookAppointment(req, res, userId, patientId, clinic_id, doctor_id);
    if (req.body.reschedule_appointmentId) {
      const patientTransaction = await commonServices.get(PatientTransaction, { where: { user_id: userId, appointment_id: req.body.reschedule_appointmentId } })
      await consultationServices.createPatientTransaction({
        userId, appointment_id: consultation.id, order_number: patientTransaction.order_number, paymentMethod: patientTransaction.payment_method, paymentType: patientTransaction.payment_method, txn_id: patientTransaction.txn_id, amount: patientTransaction.amount
      })
    } else {
      const patientTransaction = await consultationServices.createPatientTransaction({
        userId, appointment_id: consultation.id, order_number: req.body.order_number, paymentMethod: req.body.paymentMethod, paymentType: req.body.paymentMethod, txn_id: req.body.txn_id, amount: req.body.amount
      })
    }
    if (!consultation) {
      return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Consultation request") })
    }
    return res.status(200).json({ success: "true", message: message.APPOINTMENT_REQUEST_SENT("Consultation request"), data: consultation })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view all consultation request
exports.viewConsultationRequestList = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.user.patients.id
    const { page, size, s, status, type } = req.query;
    const query = {
      where: { user_id: userId, status: status },
      include: [
        { model: Patient, as: "patientdata", required: true, attributes: ["user_id", "gender", "age", "unique_id", "full_name", "profile_image"] },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: true, attributes: ["name"] }
      ],
      order: [["id", "DESC"]],
      distinct: true
    }
    const response = await consultationServices.getAllConsultationList(query, { type, status, page, size, s })
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
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view consultation request by id
exports.viewConsultationRequestById = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.id;
    const { type, status } = req.query;

    let query = {
      where: { id: requestId, status: status },
      attributes: ["id", "appointment_type", "patient_id", "doctor_id", "clinic_id", "type", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "doctor_notes", "observation", "createdAt", "is_addon", "addon_status"],
      include: [
        { model: Patient, as: "patientdata", attributes: ["id", "unique_id", "user_id", "full_name", "gender", "age", "profile_image"] },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: false, attributes: ["name"] }]
    }
    const appointment = await consultationServices.getConsultationRequestById(query, { type, status })
    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Appointment request"), data: appointment })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//cancelled or reschedule or complete appointment/consultation
exports.rescheduleOrCancelRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.user.patients.id
    const requestId = req.params.id;
    const { status } = req.query

    let query = {
      where: { id: requestId, patient_id: patientId },
      attributes: ["id", "appointment_type", "patient_id", "doctor_id", "clinic_id", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "createdAt"],
      include: [
        { model: Patient, as: "patientdata", attributes: ["id", "unique_id", "user_id", "full_name", "gender", "age", "profile_image"] },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: false, attributes: ["name"] }]
    }
    const appointment = await commonServices.get(Appointment, query)
    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }

    if (status == options.appointmentStatus.CANCELLED) {
      const t = await db.sequelize.transaction()
      try {
        const cancelAppointment = await commonServices.update(Appointment, { where: { id: appointment.id } }, { status: options.appointmentStatus.CANCELLED, cancelledBy: userId }, { transaction: t })
        const cancelAppointmentReq = await commonServices.update(AppointmentRequest, { where: { appointment_id: appointment.id } }, { status: options.appointmentStatus.CANCELLED, cancelledBy: userId }, { transaction: t })
        const patientTransaction = await commonServices.get(PatientTransaction, { where: { user_id: userId, appointment_id: appointment.id } })
        if (patientTransaction) {
          if (patientTransaction.payment_method == options.paymentMethod.RAZORPAY) {
            const receipt = commonServices.generateUniqueId(20)
            const cancelOrder = await ecommerceService.cancelRazorPayOrder({ amount: patientTransaction.amount, receipt: receipt, payment_id: patientTransaction.txn_id })
          }
          if (patientTransaction.payment_method == options.paymentMethod.PAYPAL) {
            const cancelOrder = await ecommerceService.cancelPayPalOrder({ amount: patientTransaction.amount, payment_id: patientTransaction.txn_id })
          }
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: options.paymentMethod.RAZORPAY,
            paymentType: options.paymentType.CREDIT,
            txnType: options.txnType.CONSULTATION,
            payment_id: patientTransaction.txn_id,
            amount: patientTransaction.amount,
            txn_id: patientTransaction.txn_id
          })
        }
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.RESCHEDULE) {
      const t = await db.sequelize.transaction()
      try {
        const rescheduleAppointment = await commonServices.update(Appointment, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const rescheduleAppointmentReq = await commonServices.update(AppointmentRequest, { where: { appointment_id: appointment.id } }, { status: status }, { transaction: t })
        const patientTransaction = await commonServices.get(PatientTransaction, { where: { user_id: userId, appointment_id: appointment.id } })
        if (patientTransaction) {
        if (patientTransaction.payment_method == options.paymentMethod.RAZORPAY) {
          const receipt = commonServices.generateUniqueId(20)
          const cancelOrder = await ecommerceService.cancelRazorPayOrder({ amount: patientTransaction.amount, receipt: receipt, payment_id: patientTransaction.txn_id })
        }
        if (patientTransaction.payment_method == options.paymentMethod.PAYPAL) {
          const cancelOrder = await ecommerceService.cancelPayPalOrder({ amount: patientTransaction.amount, payment_id: patientTransaction.txn_id })
        }
        const ecomTransaction = await ecommerceService.createTransaction({
          userId,
          paymentMethod: options.paymentMethod.RAZORPAY,
          paymentType: options.paymentType.CREDIT,
          txnType: options.txnType.CONSULTATION,
          payment_id: patientTransaction.txn_id,
          amount: patientTransaction.amount,
          txn_id: patientTransaction.txn_id
        }, { transaction: t })
        }
        if (!patientTransaction) {
          return res.status(200).json({ success: "false", message: message.NO_DATA("Your appointment transaction") })
        }
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }

    if (status == options.appointmentStatus.INPROCESS) {
      const t = await db.sequelize.transaction()
      try {
        const inprocessAppointment = await commonServices.update(Appointment, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const inprocessAppointmentReq = await commonServices.update(AppointmentRequest, { where: { appointment_id: appointment.id } }, { status: status }, { transaction: t })
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.COMPLETED) {
      const t = await db.sequelize.transaction()
      try {
        const complateAppointment = await commonServices.update(Appointment, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const complateAppointmentReq = await commonServices.update(AppointmentRequest, { where: { appointment_id: appointment.id } }, { status: status }, { transaction: t })
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//add review for doctor or clinic
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const uniqueId = req.user.patients.unique_id
    const { doctor_id, clinic_id, rating_point, review, review_answer } = req.body

    if (doctor_id) {
      var existId = { doctor_id }
    } else if (clinic_id) {
      var existId = { clinic_id }
    }

    const { reviewId } = req.query
    if (reviewId) {
      const existReview = await commonServices.get(UserReview, { where: { id: reviewId, user_id: userId } })
      const ansArr = JSON.parse(existReview.review_answer)
      if (ansArr.length == 2 && review_answer.length == 3) {
        const reviewCreditPoint = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.REVIEW_POINT } })
        const rewardValue = JSON.parse(JSON.stringify(reviewCreditPoint.value))
        const rewardBalance = req.user.patients.reward_balance + parseFloat(rewardValue)
        const rewardPoint = await commonServices.update(Patient, { where: { unique_id: uniqueId } }, { reward_balance: rewardBalance })
      }
      const reviewAnswer = ansArr.concat(review_answer)
      const reviewData = await commonServices.update(UserReview, { where: { id: reviewId } }, {
        review: review,
        review_answer: reviewAnswer
      })
      if (!reviewData) {
        return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Your review") })
      }
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Your review") })
    } else {
      if (doctor_id) {
        var existId = { doctor_id }
      } else if (clinic_id) {
        var existId = { clinic_id }
      }
      const uniqueReview = await commonServices.get(UserReview, { where: { user_id: userId, ...existId } })
      if (uniqueReview) {
        return res.status(200).json({ success: "false", message: message.DATA_EXIST("Your review") })
      }
      const reviewData = await commonServices.create(UserReview, {
        user_id: userId,
        doctor_id: doctor_id,
        clinic_id: clinic_id,
        rating_point: rating_point,
        review: review,
        review_answer: review_answer
      })
      const ratingScore = await consultationServices.count5StartRating(existId)
      if (doctor_id) {
        await commonServices.update(Doctor, { where: { id: doctor_id } }, { rating_point: ratingScore })
      } else if (clinic_id) {
        await commonServices.update(Clinic, { where: { id: clinic_id } }, { rating_point: ratingScore })
      }
      if (!reviewData) {
        return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Your review"), data: reviewData })
      }
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Your review") })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get doctor and clink review
exports.getDoctorOrClinicReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctor_slug, clinic_slug } = req.query
    const userData = await commonServices.get(User, { where: { slug: doctor_slug || clinic_slug, is_active: true } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }
    let clinicDoctorId = {}
    if (doctor_slug) {
      const doctorData = await commonServices.get(Doctor, { where: { user_id: userData.id } })
      clinicDoctorId.doctor_id = JSON.parse(JSON.stringify(doctorData.id))
    }
    if (clinic_slug) {
      const clinicData = await commonServices.get(Clinic, { where: { user_id: userData.id } })
      clinicDoctorId.clinic_id = JSON.parse(JSON.stringify(clinicData.id))
    }
    const userReviewData = await commonServices.getAll(UserReview, { where: { ...clinicDoctorId } })
    const reviewArr = _.map(userReviewData, (item) => JSON.parse(item.review_answer));

    const reviewPercentages = await commonConsultService.countReviewPercentage(reviewArr)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Review"), data: reviewPercentages })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }

}

//get doctor list for add on request
exports.getAllAddonDoctorList = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { page, size } = req.query;
    const appointment = await commonServices.get(Appointment, { where: { id: appointmentId, status: options.appointmentStatus.INPROCESS } })
    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    const appointmentData = JSON.parse(JSON.stringify(appointment))
    const { limit, offset } = commonServices.getPagination(page, size);
    const doctor = await consultationServices.getAllAddOnDoctors({ userId, speciality: appointmentData.speciality_id, doctorId: appointment.doctor_id, limit, offset })
    const responseData = commonServices.getPagingData(doctor, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor list") })
    }
    const doctorRes = commonResponse.modifyDoctorProfile(response.data)
    const modifyRes = {
      totalItems: response.totalItems,
      data: doctorRes,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Doctor"), data: modifyRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//send add on doctor request
exports.sendAddOnRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.body.patient_id || req.user.patients.id
    const doctor_id = req.body.doctor_id
    const appointmentId = req.params.id
    if (doctor_id.length == 0) {
      return res.status(200).json({ success: "false", message: message.VALIDATION_NECESSARY("Doctor") })
    }
    const appointment = await commonServices.get(Appointment, { where: { id: appointmentId, patient_id: patientId, status: options.appointmentStatus.INPROCESS } })
    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    const appointmentData = JSON.parse(JSON.stringify(appointment))
    const addonRequest = await consultationServices.sendAddOnRequest(req, {
      userId, patientId, appointmentId, ...appointmentData, ...req.body
    })
    if (!addonRequest) {
      return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Add on doctor request") })
    }
    return res.status(200).json({
      success: "true",
      message: message.APPOINTMENT_REQUEST_SENT("Add on doctor request")
    })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get all prescription details
exports.getAllPrescriptionDoc = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.params.id

    const prescriptionData = await consultationServices.getAllPrescriptionDocument({ patientId })

    return res.status(200).json({ success: "true", message: message.GET_DATA("Prescription document"), data: prescriptionData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view prescription document detail by id
exports.viewPrescriptionDocumentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const prescriptionDocument = await consultationServices.viewPrescriptionDocumentById({ docId })
    if (!prescriptionDocument) {
      return res.status(200).json({
        success: "false",
        message: message.NO_DATA("Document")
      })
    }
    return res.status(200).json({
      success: "true",
      message: message.GET_DATA("Document"),
      data: prescriptionDocument
    })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view treatment by id
exports.viewTreatmentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const treatmentId = req.params.id;
    const query = {
      where: { id: treatmentId },
      attributes: ["id", "name", "image_path", "description"]
    }
    const treatmentData = await commonServices.get(Treatment, query)
    if (!treatmentData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Treatment") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Treatment"), data: treatmentData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view medicine by id
exports.viewMedicineById = async (req, res) => {
  try {
    const userId = req.user.id;
    const pharmacyId = req.params.id;
    const query = {
      where: { id: pharmacyId },
      attributes: ["id", "category", "image_path", "dosage", "name", "description", "uses", "benefits_risk", "vendor", "type", "quantity", "amount", "expiry_date"]
    }
    const medicineData = await commonServices.get(Pharmacy, query)
    if (!medicineData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Medicine") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Medicine"), data: medicineData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view appointment past history
exports.viewAppointmentPastHistory = async (req, res) => {
  try {
    const { page, size, s, type } = req.query;
    const status = options.appointmentStatus.COMPLETED;
    const userId = req.user.id;
    const patientId = req.user.patients.id || req.query.patientId

    const query = {
      where: { patient_id: patientId, status: options.appointmentStatus.COMPLETED },
      attributes: ["id", "appointment_type", "patient_id", "status", "slot_timing", "treatment_id", "speciality_id", "problem_info", "createdAt"],
      include: [
        { model: Patient, as: "patientdata", required: false, attributes: ["user_id", "full_name", "profile_image"] },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: false, attributes: ["name"] }
      ],
      order: [["id", "DESC"]],
      distinct: true
    }

    const response = await consultationServices.getAllConsultationList(query, { type, status, page, size })
    if (response.data.length == 0) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    const pastAppointmentRes = commonResponse.modifyPastHistory(response.data)
    const responseData = {
      totalItems: response.totalItems,
      data: pastAppointmentRes,
      totalPages: response.totalPages,
      currentPage: response.currentPage
    }
    return res.status(200).json({ success: "true", message: message.GET_LIST("Appointment"), data: responseData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view consultation amount
exports.viewConsultaionFees = async (req, res) => {
  try {
    const userId = req.user.id
    const consultationFee = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.CONSULT_FEE } })
    const adminFee = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.ADMIN_FEE } })
    const cigarettes_price = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.CIGARETTE_PRICE } })

    const consultationAmount = parseFloat(consultationFee.value);
    const adminAmount = parseFloat(adminFee.value);
    const cigarettesPrice = parseFloat(cigarettes_price.value);
    return res.status(200).json({ success: "true", message: message.GET_DATA("Fees"), data: { consultationAmount, adminAmount, cigarettesPrice } })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get razorpay and paypal key
exports.getRazorPayAndPaypalKey = async (req, res) => {
  try {
    const userId = req.user.id
    const razorpayKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_KEY, is_active: true } })
    const razorpaySecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_SECRET, is_active: true } })
    const paypalKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_KEY, is_active: true } })
    const paypalSecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_SECRET, is_active: true } })

    const razorpay_key = razorpayKey.value;
    const razorpay_secret = razorpaySecret.value;
    const paypal_key = paypalKey.value;
    const paypal_secret = paypalSecret.value;

    return res.status(200).json({ success: "true", message: message.GET_DATA("Fees"), data: { razorpay_key, razorpay_secret, paypal_key, paypal_secret } })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// create Transcription Summary
exports.createTranscriptionSummary = async (req, res) => {
  try {
    const userId = req.user.id
    const fileUrl = req.body.fileUrl
    const appointmentId = req.params.id
    const appointmentData = await commonServices.get(Appointment, { where: { id: appointmentId } })
    if (!appointmentData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'arraybuffer'
    });
    const bufferData = Buffer.from(response.data);
    fs.writeFileSync('AISummaryFile.m4a', bufferData);

    const openai = new OpenAI({
      key: process.env.OPENAI_API_KEY
    });
    const resp = await openai.audio.transcriptions.create({
      file: fs.createReadStream('AISummaryFile.m4a'),
      model: "whisper-1",
      response_format: "text",
      language: "en",
    });
    fs.unlinkSync('AISummaryFile.m4a')

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: `Give the doctor suggestion based on this below data : ${resp}` }],
      model: "gpt-3.5-turbo",
    });
    const summaryResponse = completion.choices[0].message.content
    const appointmentSummaryRes = await commonServices.create(AppointmentSummaries, {
      appointment_id: appointmentId,
      recording_link: fileUrl,
      transcription_summary: summaryResponse,
      createdBy: userId
    })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Transcription"), data: appointmentSummaryRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
