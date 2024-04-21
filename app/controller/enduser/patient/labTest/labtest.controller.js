const db = require("../../../../models");
const { Sequelize } = require("../../../../models");
const moment = require("moment");
const _ = require("lodash");
const { methods: commonServices, getUsedRate, getConsultationFee } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content");
const { methods: labTestService } = require("../../../../services/labtest");
const { methods: consultationServices, labAppointmentExist } = require("../../../../services/consultation");
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
const LabTest = db.lab_tests;
const LabTestClinics = db.lab_test_clinics;
const HospitalAdmin = db.hospital_admins;

//Get all lab report list
exports.getAllLabReportList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size, s } = req.query
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { category: { [Op.like]: `%${s}%` } },
          { sub_category: { [Op.like]: `%${s}%` } },
          Sequelize.literal(`JSON_UNQUOTE(\`lab_tests\`.\`name\`) LIKE "%${s}%"`),
        ]
      }
    }
    const { limit, offset } = commonServices.getPagination(page, size);
    const labTest = await commonServices.getAndCountAll(LabTest, { where: { ...searchData }, order: [["id", "DESC"]], attributes: { exclude: ["createdBy", "updatedBy", "createdAt", "updatedAt", "deletedAt"] } }, limit, offset)
    const responseData = commonServices.getPagingData(labTest, page, limit);
    let labTestRes = JSON.parse(JSON.stringify(responseData))
    labTestRes.data.map(item => {
      item.name = JSON.parse(item.name)
    })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Lab report"), data: labTestRes })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get hospital list for lab test
exports.getHospitalListForLabTest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { time, day, labtestId, page, size, s } = req.query;
    const testId = labtestId.split(",")

    const { limit, offset } = commonServices.getPagination(page, size);
    const clinicList = await labTestService.getAllLabClinics({ time, day, testId, limit, offset })
    const responseData = commonServices.getPagingData(clinicList, page, limit);
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
        attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_phone_number", "rating_point", "address", "pincode", "bio", "service_24X7", "equipments", "consultation_fees", "clinic_image", "createdAt"],
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
          { model: LabTestClinics, as: "clinicLabTest", required: false, attributes: ["id", "lab_test_id", "price"], include: [{ model: LabTest, as: "lab_tests", attributes: ["category", "sub_category", "name"] }] }
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

//create labtest payment
exports.createLabtestPayment = async (req, res) => {
  try {
    const userId = req.user.id
    const { coupon_code, clinicId, labtestId } = req.body
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
    const paymentAmount = await commonConsultService.calculateTotalPaymentAmount({ discountValue, clinicId, labtestId })
    const usdAmount = await getUsedRate()
    const receipt = commonServices.generateUniqueId(20);
    if (method == options.paymentMethod.RAZORPAY) {
      const paymentData = await ecommerceService.createRazorPayOrder(paymentAmount.netTotal * usdAmount, 'INR', receipt)
      if (!paymentData) {
        return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
      }
      const appointmentOrder = await consultationServices.createAppointmentOrder(req, { sub_total: paymentAmount.subTotal, discount: paymentAmount.discountPrice, net_total: paymentAmount.netTotal, txn_type: options.txnType.APPOINTMENT, userId, orderId: paymentData.id })
      if (!appointmentOrder) {
        return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
      }
      return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: paymentData })
    }

    if (method == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.WEB) {
        const paymentData = await ecommerceService.createPaypalPayment({ amount: paymentAmount.netTotal })
        const appointmentOrder = await consultationServices.createAppointmentOrder(req, { sub_total: paymentAmount.subTotal, discount: paymentAmount.discountPrice, net_total: paymentAmount.netTotal, txn_type: options.txnType.APPOINTMENT, userId, orderId: `${paymentData.id}` })
        if (!appointmentOrder) {
          return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
        }
        return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: paymentData })
      } else if (deviceType == options.deviceType.APP) {
        const appointmentOrder = await consultationServices.createAppointmentOrder(req, { sub_total: paymentAmount.subTotal, discount: paymentAmount.discountPrice, net_total: paymentAmount.netTotal, txn_type: options.txnType.APPOINTMENT, userId, orderId: `order_${commonServices.generateUniqueId(14)}` })
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

//verify lab payment
exports.verifyLabPayment = async (req, res) => {
  try {
    const userId = req.user.id
    const { paymentId, order_id, method, deviceType } = req.query
    const { amount, txn_id } = req.body
    if (method == options.paymentMethod.RAZORPAY) {
      const verifyPayment = await ecommerceService.verifyRazorpayOrder(req, { order_id, payment_id: paymentId })
      if (verifyPayment === true) {
        const addTransaction = async (amountType, txntype) => {
          return await ecommerceService.createTransaction({
            userId,
            paymentMethod: method,
            paymentType: options.paymentType.DEBIT,
            txnType: txntype,
            payment_id: paymentId,
            amount: amount[amountType],
            txn_id,
            ...req.query
          })
        }
        const ecomTransaction = await addTransaction("labTest", options.txnType.LABREPORT);
        const ecomTransaction2 = await addTransaction("appointment", options.txnType.APPOINTMENT);
        if (!ecomTransaction || !ecomTransaction2) {
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
          const addTransaction = async (amountType, txntype) => {
            return await ecommerceService.createTransaction({
              userId,
              paymentMethod: method,
              paymentType: options.paymentType.DEBIT,
              txnType: txntype,
              payment_id: paymentId,
              amount: amount[amountType],
              txn_id,
              ...req.query
            })
          }
          const ecomTransaction = await addTransaction("labTest", options.txnType.LABREPORT);
          const ecomTransaction2 = await addTransaction("appointment", options.txnType.APPOINTMENT);
          if (!ecomTransaction || !ecomTransaction2) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }
          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        }
      } else if (deviceType == options.deviceType.WEB) {
        var verifyPayment = await ecommerceService.executePaypalPayment({ order_id })
        if (verifyPayment != null) {
          const addTransaction = async (amountType, txntype) => {
            return await ecommerceService.createTransaction({
              userId,
              paymentMethod: method,
              paymentType: options.paymentType.DEBIT,
              txnType: txntype,
              payment_id: paymentId,
              amount: amount[amountType],
              txn_id,
              ...req.query
            })
          }
          const ecomTransaction = await addTransaction("labTest", options.txnType.LABREPORT);
          const ecomTransaction2 = await addTransaction("appointment", options.txnType.APPOINTMENT);
          if (!ecomTransaction || !ecomTransaction2) {
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

//book lab appointment
exports.bookLabReportAppointment = async (req, res) => {
  const userId = req.user.id;
  const patientId = req.body.patient_id || req.user.patients.id
  const clinic_id = req.body.clinic_id
  try {
    const existData = await labAppointmentExist({
      appointment_type: req.body.appointment_type, userId: userId, patient_id: patientId, clinicId: clinic_id, slot_timing: req.body.slot_timing, createdBy: userId
    })
    if (!existData) {
      return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_EXIST("Lab appointment request") })
    }
    const hospitalData = await commonServices.get(Clinic, {
      where: { id: clinic_id, status: options.ClinicStatus.APPROVE },
      include: [{ model: HospitalAdmin, as: "clinicAdmin", attributes: ["id", "wallet_balance"] }]
    })
    const hospitalDetail = JSON.parse(JSON.stringify(hospitalData))
    const labAppointmentData = await consultationServices.bookLabAppointment(req, res, userId, patientId, clinic_id);
    if (req.body.reschedule_appointmentId) {
      const patientTransaction = await commonServices.get(PatientTransaction, { where: { user_id: userId, appointment_id: req.body.reschedule_appointmentId } })
      await consultationServices.createPatientTransaction({
        userId, appointment_id: labAppointmentData.id, order_number: patientTransaction.order_number, paymentMethod: patientTransaction.payment_method, paymentType: patientTransaction.payment_method, txn_id: patientTransaction.txn_id, amount: patientTransaction.amount, remarks: "Lab appointment payment"
      })
    } else {
      const patientTransaction = await consultationServices.createPatientTransaction({
        userId, appointment_id: labAppointmentData.id, order_number: req.body.order_number, paymentMethod: req.body.paymentMethod, paymentType: req.body.paymentMethod, txn_id: req.body.txn_id, amount: req.body.amount, remarks: "Lab appointment payment"
      })
      const consultationCharge = await getConsultationFee()
      const hospitalBalance = hospitalDetail.clinicAdmin.wallet_balance + (req.body.amount - consultationCharge)
      await commonServices.update(HospitalAdmin, { where: { id: hospitalDetail.clinicAdmin.id } }, { wallet_balance: hospitalBalance })
    }
    if (!labAppointmentData) {
      return res.status(200).json({ success: "false", message: message.APPOINTMENT_REQUEST_SENT_FAILED("Lab appointment request") })
    }
    return res.status(200).json({ success: "true", message: message.APPOINTMENT_REQUEST_SENT("Lab appointment request"), data: labAppointmentData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view all consultation request
exports.viewLabAppointmentList = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.user.patients.id
    const { page, size, s, status, type } = req.query;
    const query = {
      where: { user_id: userId, status: status },
      include: [
        { model: Patient, as: "patientdata", required: true, attributes: ["user_id", "gender", "age", "unique_id", "full_name", "profile_image"] }
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
      attributes: ["id", "appointment_type", "patient_id", "doctor_id", "clinic_id", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "doctor_notes", "observation", "createdAt", "is_addon", "addon_status"],
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
