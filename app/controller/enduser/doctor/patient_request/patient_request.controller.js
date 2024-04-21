const db = require("../../../../models");
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
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");
const moment = require("moment");
const Op = db.Sequelize.Op;


const AppointmentRequests = db.appointment_requests;
const Appointments = db.appointments;
const PatientBilling = db.patient_billings;
const PatientSuggestedLabtest = db.patient_suggested_labtest;
const Patient = db.patients;
const Speciality = db.specialities;
const Treatment = db.treatments;
const User = db.users;
const UserDetails = db.user_details;
const Doctors = db.doctors;
const PatientTreatments = db.patient_treatments;
const PatientMedicines = db.patient_medicines;
const PrescriptionDocuments = db.prescription_documents;
const PatientSymptoms = db.patient_symptoms;
const PatientDiseases = db.patient_diseases;
const PatientTransaction = db.patient_transactions;
const PatientAssignNurses = db.patient_assign_nurses;
const Clinic = db.clinics;
const JitsiRoom = db.jitsi_rooms;
const Medicines = db.medicines;
const Symptoms = db.symptoms;
const Diseases = db.diseases;
const LabTestClinics = db.lab_test_clinics;
const LabTests = db.lab_tests;
const LabTestPatients = db.lab_test_patients;
const Pharmacy = db.pharmacies;
const PharmacyOrders = db.pharmacy_orders;
const PharmacyOrderDetails = db.pharmacy_order_details;
const AssignBeds = db.assign_beds;


// change request status by id
exports.changeRequestStatusByid = async (req, res) => {
  try {
    const appointmentReqId = req.params.id;
    const user = await commonServices.get(AppointmentRequests, { where: { id: appointmentReqId } })
    const appoitmentId = user.appointment_id;
    const userData = await commonServices.get(Appointments, { where: { id: appoitmentId } })
    const patientUserId = userData.user_id;
    const doctorId = user.doctor_id;
    const isAddon = user.is_addon;
    const status = req.body.status;

    const data = await consultationServices.acceptAndDeclainAppointmentReq(res, { status, isAddon, patientUserId, appoitmentId, appointmentReqId, doctorId, ...req.body });

    if (data == true) {
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Request status") })
    } else {
      return res.status(200).json({ success: "false", message: message.CHANGE_DATA_FAILED("Request status") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//view consultation request by id
exports.viewConsultationRequestById = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId, '----------------------- user id -------------------------');
    console.log(req.user.doctors.id, '-------------------- doctor id ----------------------------');
    const appointmentId = req.params.id;
    const { type, status } = req.query;

    const isExist = await commonServices.get(Appointments, { where: { id: appointmentId } })
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }

    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    let query = {
      where: { id: appointmentId, patient_id: patientId, status: status },
      attributes: ["id", "appointment_type", "patient_id", "doctor_id", "clinic_id", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "doctor_notes", "observation", "createdAt", "is_addon", "addon_status"],
      include: [
        {
          model: Patient, as: "patientdata", attributes: ["id", "unique_id", "user_id", "full_name", "gender", "age"],
          include: [
            {
              model: User, as: "usersData", required: false, attributes: ["id", "email", "slug", "phone_no", "profile_image"],
              include: [
                { model: UserDetails, as: "user_details", required: false, attributes: ["pincode", "address1"] },
              ]
            },
          ]
        },
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

//view prescription document detail by id
exports.viewPrescriptionDocById = async (req, res) => {
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

// add suggested treatment
exports.addSuggestedTreatment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    const obj = {
      appointment_id: appointmentId,
      patient_id: patientId,
      treatment_id: req.body.treatment_id,
      createdBy: userId,
    }

    await commonServices.create(PatientTreatments, obj)
    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'treatment' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Treatment") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add suggested medicines
exports.addSuggestedMedicine = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const doctorUserId = req.user.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }

    const patientId = user.patient_id;
    const obj = {
      appointment_id: appointmentId,
      patient_id: patientId,
      medicine_id: req.body.medicine_id,
      dose: req.body.dose,
      duration: req.body.duration,
      day_time: req.body.day_time,
      taken_time: req.body.taken_time,
      repeat: req.body.repeat,
      createdBy: doctorUserId,
    }
    const addPatientMedicine = await commonServices.create(PatientMedicines, obj)

    // doctor ne je clinic mathi req aaveli che teni pharmacy ma req moklse
    if (user.appointment_type == "in_clinic") {

      const requestedClinicId = user.clinic_id
      const isClinicPharmacy = await commonServices.get(Clinic, { where: [{ id: requestedClinicId }, { has_pharmacy: true }] })

      if (isClinicPharmacy != null) {
        //te pharmacy ma stok ma che k nhi?
        const clinicPharmacy = await commonServices.get(Pharmacy, { where: [{ medicine_id: req.body.medicine_id }, { clinic_id: requestedClinicId }] })
        if (clinicPharmacy != null) {


          const isStockAvailable = clinicPharmacy.quantity;
          const medicineAmount = clinicPharmacy.amount;
          const pharmacyId = clinicPharmacy.id;
          const medicineId = clinicPharmacy.medicine_id

          if (isStockAvailable != 0) {
            // clinic ni pharmacy ma stock available hoy to j

            const findAssignBed = await commonServices.get(AssignBeds, { where: [{ appointment_id: appointmentId }] })
            const bedId = findAssignBed.bed_id;
            const orderNumber = await commonServices.generateOrderId(14)
            const patientData = await commonServices.get(Patient, { where: [{ id: patientId }] })
            const patientUserId = patientData.user_id;
            const totlePrice = medicineAmount * req.body.quantity;

            const t = await db.sequelize.transaction();
            try {
              const obj = {
                appointment_id: appointmentId,
                user_id: patientUserId,
                clinic_id: requestedClinicId,
                category_type: options.categoryType.PATIENT,
                bed_id: bedId,
                order_number: orderNumber,
                payment_method: options.paymentMethod.CASH,
                payment_type: options.paymentType.CREDIT,
                txn_type: options.txnType.PURCHASE,
                sub_total: totlePrice,
                net_total: totlePrice,
                createdBy: doctorUserId,
              }
              const reqOrderToPharmacy = await commonServices.create(PharmacyOrders, obj, { transaction: t })
              if (!reqOrderToPharmacy) {
                await t.rollback();
                return false
              }

              const obj2 = {
                pharmacy_order_id: reqOrderToPharmacy.id,
                pharmacy_id: pharmacyId,
                quantity: req.body.quantity,
                price: totlePrice,
                status: options.pharmacyOrderStatus.REQUESTED,
              }
              const reqOrderToPharmacyOrderDetail = await commonServices.create(PharmacyOrderDetails, obj2, { transaction: t })
              if (!reqOrderToPharmacyOrderDetail) {
                await t.rollback();
                return false
              }

              await t.commit()
              const patientMedicineId = addPatientMedicine.id;
              const pharmacyOrderId = reqOrderToPharmacy.id;
              await commonServices.update(PatientMedicines, { where: [{ id: patientMedicineId }] }, { pharmacy_order_id: pharmacyOrderId })

            } catch (error) {
              await t.rollback();
              return error
            }
          }
        }
      }
    }

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'medicine' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Medicine") })
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add suggested lab test (consultation flow)
exports.addsuggestedLabsTest = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;

    const isExist = await commonServices.get(PatientSuggestedLabtest, { where: [{ lab_test_id: req.body.lab_test_id }, { doctor_id: doctorId }] })
    if (isExist) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This suggested lab test") })
    }

    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;
    const obj = {
      appointment_id: appointmentId,
      patient_id: patientId,
      doctor_id: doctorId,
      lab_test_id: req.body.lab_test_id,
      createdBy: userId,
    }
    await commonServices.create(PatientSuggestedLabtest, obj)

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'lab test' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Suggested lab test") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add patient new lab reports (appointment flow)
exports.addNewLabReport = async (req, res) => {
  try {

    const userId = req.user.id;
    const appointmentId = req.params.id;

    const labData = await commonServices.get(LabTests, { where: { id: req.body.lab_test_id } })
    if (!labData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Lab test of clinic") })
    }

    const clinicLabData = await commonServices.get(LabTestClinics, { where: { id: req.body.lab_test_clinic_id } })
    if (!clinicLabData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Lab test of clinic") })
    }

    const labTestPrice = clinicLabData.price;
    const obj = {
      patient_id: req.body.patient_id,
      doctor_id: req.body.doctor_id, // doctor's id who add labtest
      appointment_id: appointmentId,
      lab_test_clinic_id: req.body.lab_test_clinic_id, // hospital name who has own lab (from listing)
      lab_test_id: req.body.lab_test_id, // hospital's lab test id (from listing)
      price: labTestPrice, // labtest id of clinic price
      status: options.labTestStatus.PENDING,
      createdBy: userId,
    }
    const data = await commonServices.create(LabTestPatients, obj)

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: req.body.patient_id } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'lab report' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Lab report") })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// add symptoms
exports.addSymptoms = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    const symptomsArr = req.body.symptoms.map(item => {
      return {
        appointment_id: appointmentId,
        patient_id: patientId,
        symptoms_id: item.symptoms_id,
        description: item.description,
        createdBy: userId
      }
    })
    await commonServices.bulkCreate(PatientSymptoms, symptomsArr)

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'Symptoms' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Symptoms") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add disease/diagnosis
exports.addDisease = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    const diseasesArr = req.body.disease.map(item => {
      return {
        appointment_id: appointmentId,
        patient_id: patientId,
        disease_id: item.disease_id,
        createdBy: userId
      }
    })
    await commonServices.bulkCreate(PatientDiseases, diseasesArr)

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'disease' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Disease") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add observation & doctor notes 
exports.addObservation = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    const obj = {
      observation: req.body.observation,
      doctor_notes: req.body.doctor_notes,
    }

    await commonServices.update(Appointments, { where: { id: appointmentId } }, obj)
    return res.status(200).json({ success: "true", message: message.ADD_DATA("") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add prescription doc
exports.addPrescriptionDoc = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    const obj = {
      appointment_id: appointmentId,
      patient_id: patientId,
      doc_name: req.body.doc_name,
      doc_path: req.body.doc_path,
      referral_doctor_id: doctorId,
      createdBy: userId,
    }

    await commonServices.create(PrescriptionDocuments, obj)

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'prescription document' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Prescription document") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add hr billing
exports.addHrBilling = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;
    await consultationServices.addHrBilling(res, { patientId, appointmentId, userId, ...req.body })

    // for push notification -----------
    const userData = await commonServices.get(Patient, { where: { id: patientId } });
    const patientUserId = userData.user_id;
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'billing' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Billing") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add payment history
exports.addPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;
    const patientUserId = user.user_id;

    await consultationServices.addPaymentHistory(res, { patientId, patientUserId, appointment_id: appointmentId, userId, ...req.body })

    // for push notification -----------
    const payload = fcmNotificationPayload.addSuggested({ userId: patientUserId, body: 'payment history' })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Payment history") })
  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: "false1", message: error.message })
  }
};

// delete payment history
exports.deletePaymentHistory = async (req, res) => {
  try {
    const patientTransactionId = req.params.id;
    const isExist = await commonServices.get(PatientTransaction, { where: { id: patientTransactionId } })
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Cash payment history") })
    }
    const orderNumber = isExist.order_number;
    const userId = isExist.user_id;

    const data = await consultationServices.deletePaymentHistory({ id: patientTransactionId, orderNumber, userId })
    if (data) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Cash payment history") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Cash payment history") })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// delete hr billing
exports.deleteHrBilling = async (req, res) => {
  try {
    const id = req.params.id;

    const isExist = await commonServices.get(PatientBilling, { where: { id: id } })
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Billing") })
    }

    const data = await commonServices.delete(PatientBilling, { where: { id: id } })
    if (data) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Billing") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Billing") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete suggested treatment
exports.deleteTreatment = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await commonServices.delete(PatientTreatments, { where: { id: id } })
    if (data) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Treatment") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Treatment") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete diseases
exports.deleteDiseases = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await commonServices.delete(PatientDiseases, { where: { id: id } })
    if (data) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Diseases") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Diseases") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete suggested symptoms
exports.deleteSymptoms = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await commonServices.delete(PatientSymptoms, { where: { id: id } })
    if (data) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Symtoms") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Symtoms") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete suggested medicines
exports.deleteSuggestedMedicine = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await commonServices.delete(PatientMedicines, { where: { id: id } })
    if (data) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Medicine") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Medicine") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// clinic lab test listing
exports.getClinicAllLabTest = async (req, res) => {
  try {
    const clinicId = req.params.id;
    const query = {
      where: [{ clinic_id: clinicId }],
      attributes: ["price"],
      group: ["lab_test_id"],
      include: [
        { model: LabTests, as: "lab_tests", attributes: ['id', 'name'] }
      ]
    }
    const labTestClinic = await commonServices.getAll(LabTestClinics, query)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Lab test of clinic"), data: labTestClinic })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// clinic listing of which has own lab
exports.clinicListingOfOwnLab = async (req, res) => {
  try {
    const query = {
      where: [{}],
      attributes: ["id", "clinic_id"],
      group: ["clinic_id"],
      include: [
        { model: Clinic, as: "clinicsLab", attributes: ['clinic_name'] }
      ]
    }
    const labTestClinic = await commonServices.getAll(LabTestClinics, query)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Lab test of clinic"), data: labTestClinic })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// medicines dropdown
exports.medicineDropdown = async (req, res) => {
  try {
    const specialityId = req.params.id;

    const { s } = req.query;
    var DataObj = {}
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const query = {
      where: [DataObj, { speciality_id: specialityId }],
      attributes: ['id', 'slug', 'name']
    }
    const data = await commonServices.getAll(Medicines, query)
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Medicine"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// medicines dropdown
exports.medicineDropdownWithoutSpeciality = async (req, res) => {
  try {
    const { s } = req.query;
    var DataObj = {}
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const query = {
      where: [DataObj],
      attributes: ['id', 'slug', 'name']
    }
    const data = await commonServices.getAll(Medicines, query)
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Medicine"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// symptoms dropdown
exports.symptomsDropdown = async (req, res) => {
  try {
    const query = {
      where: [],
      attributes: ['id', 'name']
    }
    const data = await commonServices.getAll(Symptoms, query)
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Symptoms"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// diseases dropdown
exports.diseasesDropdown = async (req, res) => {
  try {
    const specialityId = req.params.id;
    const query = {
      where: [{ speciality_id: specialityId }],
      attributes: ['id', 'name']
    }
    const data = await commonServices.getAll(Diseases, query)
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Diseases"), data: data })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// move to complete apppointment
exports.moveToComplete = async (req, res) => {
  try {
    const status = options.appointmentStatus.COMPLETED;
    const appointmentId = req.params.id;
    const doctorId = req.user.doctors.id;

    const t = await db.sequelize.transaction()
    try {
      const complateAppointment = await commonServices.update(Appointments, { where: { id: appointmentId } }, { status: status }, { transaction: t })
      const complateAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointmentId, doctor_id: doctorId } }, { status: status }, { transaction: t })
      await t.commit()

      // for push notification -----------
      const appointmentData = await commonServices.get(Appointments, { where: { id: appointmentId } })
      const patientId = appointmentData.patient_id;
      const userData = await commonServices.get(Patient, { where: { id: patientId } });
      const patientUserId = userData.user_id;
      const payload = fcmNotificationPayload.appointmentStatus({ userId: patientUserId, body: options.appointmentStatus.COMPLETED })
      await sendAllNotification.sendAllNotification({ payload })

      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
    } catch (error) {
      return res.status(200).json({ success: "false", message: error.message })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// change apppointment status (cancelled, inprocess, rechedule, completed)
exports.cancleOrRescheduleApppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;
    const appointmentId = req.params.id;
    const { status } = req.query

    let query = {
      where: { id: appointmentId },
      attributes: ["id", "appointment_type", "patient_id", "doctor_id", "clinic_id", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "createdAt"],
      include: [
        { model: Patient, as: "patientdata", attributes: ["id", "unique_id", "user_id", "full_name", "gender", "age", "profile_image"] },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: false, attributes: ["name"] }]
    }
    const appointment = await commonServices.get(Appointments, query)
    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }


    if (status == options.appointmentStatus.CANCELLED) {
      const t = await db.sequelize.transaction()
      try {
        const cancelAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, doctor_id: doctorId } }, { status: options.appointmentStatus.CANCELLED, cancelledBy: userId }, { transaction: t })
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.RESCHEDULE) {
      const t = await db.sequelize.transaction()
      try {
        const rescheduleAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const rescheduleAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, doctor_id: doctorId } }, { status: status }, { transaction: t })
        const patientTransaction = await commonServices.get(PatientTransaction, { where: { user_id: userId, appointment_id: appointment.id } })
        // if (patientTransaction) {
        // if (patientTransaction.payment_method == options.paymentMethod.RAZORPAY) {
        //   const receipt = commonServices.generateUniqueId(20)
        //   const cancelOrder = await ecommerceService.cancelRazorPayOrder({ amount: patientTransaction.amount, receipt: receipt, payment_id: patientTransaction.txn_id })
        // }
        // if (patientTransaction.payment_method == options.paymentMethod.PAYPAL) {
        //   const cancelOrder = await ecommerceService.cancelPayPalOrder({ amount: patientTransaction.amount, payment_id: patientTransaction.txn_id })
        // }
        // const ecomTransaction = await ecommerceService.createTransaction({
        //   userId,
        //   paymentMethod: options.paymentMethod.RAZORPAY,
        //   paymentType: options.paymentType.CREDIT,
        //   txnType: options.txnType.CONSULTATION,
        //   payment_id: patientTransaction.txn_id,
        //   amount: patientTransaction.amount,
        //   txn_id: patientTransaction.txn_id
        // }, { transaction: t })
        // }
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
        const inprocessAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const inprocessAppointmentReq = await commonServices.update(AppointmentRequests, { where: [{ appointment_id: appointment.id }, { doctor_id: doctorId }] }, { status: status }, { transaction: t })
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.COMPLETED) {
      const t = await db.sequelize.transaction()
      try {
        const complateAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const complateAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, doctor_id: doctorId } }, { status: status }, { transaction: t })
        await t.commit()
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// inprocess appointment status
exports.changeInToInprocessApppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;
    const appointmentId = req.params.id;
    const status = req.body.status;

    let query = {
      where: { id: appointmentId },
      attributes: ["id", "appointment_type", "patient_id", "doctor_id", "clinic_id", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "createdAt"],
      include: [
        { model: Patient, as: "patientdata", attributes: ["id", "unique_id", "user_id", "full_name", "gender", "age", "profile_image"] },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: false, attributes: ["name"] }]
    }
    const appointment = await commonServices.get(Appointments, query)
    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }

    if (status == options.appointmentStatus.INPROCESS) {
      const t = await db.sequelize.transaction()
      try {
        const inprocessAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status, type: options.appointmentType.IPD }, { transaction: t })
        const inprocessAppointmentReq = await commonServices.update(AppointmentRequests, { where: [{ appointment_id: appointment.id }, { doctor_id: doctorId }] }, { status: status, type: options.appointmentType.IPD }, { transaction: t })
        await t.commit()

        // for push notification -----------
        const patientId = appointment.patient_id;
        const userData = await commonServices.get(Patient, { where: { id: patientId } });
        const patientUserId = userData.user_id;
        const payload = fcmNotificationPayload.appointmentStatus({ userId: patientUserId, body: options.appointmentType.IPD })
        await sendAllNotification.sendAllNotification({ payload })

        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        console.log(error);
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: "false", message: error.message })
  }
};

//view appointment past history
exports.viewPatientPastHistoryListing = async (req, res) => {
  try {
    const { page, size, s, type } = req.query;
    const status = options.appointmentStatus.COMPLETED;

    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } })
    const userId = user.id;

    const patientData = await commonServices.get(Patient, { where: { user_id: userId } })
    const patientId = patientData.id

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
      return res.status(200).json({ success: "false", message: message.NO_DATA("Document") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Document"), data: prescriptionDocument })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//join jitsi room
exports.joinJitsiRoom = async (req, res) => {
  try {
    const userId = req.user.id
    const doctorId = req.user.doctors.id
    const appointmentId = req.params.id;
    const JitsiRoomData = await commonServices.get(JitsiRoom, {
      where: { appointment_id: appointmentId, doctor_id: doctorId },
      attributes: ["id", "appointment_id", "patient_id", "room_id", "doctor_id", "room_type"]
    })
    if (!JitsiRoomData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Room data") })
    } else {
      const startJitsi = await commonServices.update(JitsiRoom, { where: { id: JitsiRoomData.id } }, { is_host: true })
      if (startJitsi[0] == 1) {
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Room data"), data: JitsiRoomData })
      } else {
        return res.status(200).json({ success: "false", message: message.CHANGE_DATA_FAILED("Room data") })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}
