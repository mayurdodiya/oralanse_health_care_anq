const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require("moment")
const { methods: consultationServices } = require("../../../../services/consultation");
const sendAllNotification = require("../../../../services/settings");
const emailTmplateServices = require("../../../../services/email_template")
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");
const _ = require("lodash");



const Patient = db.patients;
const User = db.users;
const Appointments = db.appointments;
const AppointmentRequests = db.appointment_requests;
const AssignBeds = db.assign_beds;
const Beds = db.beds;
const DoctorSpecialities = db.doctor_specialities;
const Doctors = db.doctors;
const Speciality = db.specialities;
const Treatment = db.treatments;
const PatientTransaction = db.patient_transactions;
const PatientInsurances = db.patient_insurances;
const LabTestPatients = db.lab_test_patients;
const LabTests = db.lab_tests;
const PatientAssignNurses = db.patient_assign_nurses;
const ClinicStaffs = db.clinic_staffs;



// view all appointment request listing
exports.appointmentListing = async (req, res) => {
  try {

    const clinicId = req.user.clinics.id;

    const type = options.appointmentType.INCLINIC;
    const { page, size, status } = req.query;

    const response = await consultationServices.getAllAppointmentListOfClinic({ clinicId, status, type, page, size })
    console.log(response);
    // const appointmentRes = commonResponse.modifyAppointment(response)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Appointment"), data: response })

  } catch (error) {
    console.log(error);
    res.status(200).json({ success: " false", message: error.message })
  }
};

// view appointment request by id
exports.viewConsultationRequestById = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;
    // const clinicId = req.user.clinics.id;
    const status = req.query.status;
    const type = "clinic";

    let query = {
      where: [{ id: appointmentId }, { patient_id: patientId }, { appointment_type: options.appointmentType.INCLINIC }, { status: status }],
      attributes: ["id", "appointment_type", "type", "patient_id", "doctor_id", "clinic_id", "slot_timing", "treatment_id", "speciality_id", "status", "problem_info", "doctor_notes", "observation", "createdAt", "is_addon", "addon_status"],
      include: [
        {
          model: Patient, as: "patientdata", attributes: ["id", "unique_id", "user_id", "full_name", "gender", "age", "profile_image"],
          include: [
            { model: User, as: "usersData", required: false, attributes: ["slug"] },
          ]
        },
        { model: Treatment, as: "treatmentdata", required: false, attributes: ["name"] },
        { model: Speciality, as: "specialitydata", required: false, attributes: ["name"] }]
    }
    const appointment = await consultationServices.getConsultationRequestById(query, { type, status })

    if (!appointment) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") })
    }
    if (appointment.patientMedicine) {
      appointment.patientMedicine.map(item => {
        item.day_time = JSON.parse(item.day_time)
      })
    }

    return res.status(200).json({ success: "true", message: message.GET_DATA("Appointment request"), data: appointment })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

// change apppointment status (cancelled, inprocess, rechedule, completed)
exports.cancleOrRescheduleApppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;
    const appointmentId = req.params.id;
    const { status } = req.query;

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
        const cancelAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, clinic_id: clinicId } }, { status: options.appointmentStatus.CANCELLED, cancelledBy: userId }, { transaction: t })

        await t.commit()

        // for push notification -----------
      const patientId = appointment.patient_id;
      const userData = await commonServices.get(Patient, { where: { id: patientId } });
      const patientUserId = userData.user_id;
      const payload = fcmNotificationPayload.clinicAppointmentStatus({ userId: patientUserId, body: status })
      await sendAllNotification.sendAllNotification({ payload })

        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.RESCHEDULE) {
      const t = await db.sequelize.transaction()
      try {
        const rescheduleAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const rescheduleAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, clinic_id: clinicId } }, { status: status }, { transaction: t })
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
        
        // for push notification -----------
      const patientId = appointment.patient_id;
      const userData = await commonServices.get(Patient, { where: { id: patientId } });
      const patientUserId = userData.user_id;
      const payload = fcmNotificationPayload.clinicAppointmentStatus({ userId: patientUserId, body: status })
      await sendAllNotification.sendAllNotification({ payload })

        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.INPROCESS) {
      const t = await db.sequelize.transaction()
      try {
        const inprocessAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const inprocessAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, clinic_id: clinicId } }, { status: status }, { transaction: t })
        await t.commit()
        
        // for push notification -----------
      const patientId = appointment.patient_id;
      const userData = await commonServices.get(Patient, { where: { id: patientId } });
      const patientUserId = userData.user_id;
      const payload = fcmNotificationPayload.clinicAppointmentStatus({ userId: patientUserId, body: status })
      await sendAllNotification.sendAllNotification({ payload })

        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
    if (status == options.appointmentStatus.COMPLETED) {
      const t = await db.sequelize.transaction()
      try {
        const complateAppointment = await commonServices.update(Appointments, { where: { id: appointment.id } }, { status: status }, { transaction: t })
        const complateAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointment.id, clinic_id: clinicId } }, { status: status }, { transaction: t })
        await t.commit()

        // for push notification -----------
      const patientId = appointment.patient_id;
      const userData = await commonServices.get(Patient, { where: { id: patientId } });
      const patientUserId = userData.user_id;
      const payload = fcmNotificationPayload.clinicAppointmentStatus({ userId: patientUserId, body: status })
      await sendAllNotification.sendAllNotification({ payload })

        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
      } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// accept/decline appointment
exports.appointmentConfirmation = async (req, res) => {
  try {
    const appointmentReqId = req.params.id;
    const user = await commonServices.get(AppointmentRequests, { where: { id: appointmentReqId } })
    const appoitmentId = user.appointment_id;
    const userData = await commonServices.get(Appointments, { where: { id: appoitmentId } })
    const patientUserId = userData.user_id;
    const clinicId = user.clinic_id;
    const userId = req.user.id;
    const doctorId = req.body.doctor_id;
    const status = req.body.status;
    const isAddon = userData.is_addon;

    if (req.body.doctor_id) {
      const isDoctorApproved = await commonServices.get(Doctors, { where: [{ id: doctorId }, { status: options.DoctorStatus.APPROVE }] })
      if (!isDoctorApproved) {
        return res.status(200).json({ success: "false", message: message.NOT_APPROVED("doctor") })
      }
    }

    if (req.body.bed_id) {
      const isBedExist = await commonServices.get(Beds, { where: [{ id: req.body.bed_id }, { clinic_id: clinicId }] })
      if (!isBedExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("This bed") })
      }
    }

    const data = await consultationServices.acceptAndDeclainAppointmentReq(res, { isAddon, appointmentReqId, status, userId, patientUserId, appoitmentId, doctorId, clinicId, ...req.body });
    if (data == true) {
      if (status == "accept") {

        const bedAvailability = await commonServices.get(Beds, { where: { id: req.body.bed_id } })
        if (bedAvailability.status == options.BedAllotmentStatus.OCCUPIED) {
          return res.status(200).json({ success: "false", message: message.OCCUPIED("bed") })
        }

        await commonServices.create(AssignBeds, { appointment_id: appoitmentId, bed_id: req.body.bed_id, createdBy: userId })
        await commonServices.update(Beds, { where: [{ id: req.body.bed_id }] }, { status: options.BedAllotmentStatus.OCCUPIED, updatedBy: userId })
      }

      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Request status") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// move to complete apppointment
exports.moveToComplete = async (req, res) => {
  try {
    const status = options.appointmentStatus.COMPLETED;
    const appointmentId = req.params.id;
    const clinicId = req.user.clinics.id;

    const t = await db.sequelize.transaction()
    try {
      const complateAppointment = await commonServices.update(Appointments, { where: { id: appointmentId } }, { status: status }, { transaction: t })
      const complateAppointmentReq = await commonServices.update(AppointmentRequests, { where: { appointment_id: appointmentId, clinic_id: clinicId } }, { status: status }, { transaction: t })
      await t.commit()

      // for push notification -----------
      const appointmentData = await commonServices.get(Appointments, { where: { id: appointmentId } })
      const patientId = appointmentData.patient_id;
      const userData = await commonServices.get(Patient, { where: { id: patientId } });
      const patientUserId = userData.user_id;
      const payload = fcmNotificationPayload.clinicAppointmentStatus({ userId: patientUserId, body: options.appointmentStatus.COMPLETED })
      await sendAllNotification.sendAllNotification({ payload })

      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Appointment status") })
    } catch (error) {
      return res.status(200).json({ success: "false", message: error.message })
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message })
  }
};

// inprocess appointment status
exports.changeInToInprocessApppointmentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const status = req.body.status;
    const clinicId = req.user.clinics.id;

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
        const inprocessAppointmentReq = await commonServices.update(AppointmentRequests, { where: [{ appointment_id: appointment.id }, { clinic_id: clinicId }] }, { status: status, type: options.appointmentType.IPD }, { transaction: t })
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

// bed drop down
exports.bedListing = async (req, res) => {
  try {

    const clinicId = req.user.clinics.id;
    const roomNo = req.params.id;
    const query = {
      where: [{ clinic_id: clinicId }, { status: options.BedAllotmentStatus.VACCANT }, { room_number: roomNo }],
      attributes: ['id', 'clinic_id', 'bed_number', 'status']
    }
    const response = await commonServices.getAll(Beds, query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Bed number"), data: response })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// room no dropdown
exports.roomNoListing = async (req, res) => {
  try {

    const clinicId = req.user.clinics.id;
    const query = {
      where: [{ clinic_id: clinicId }, { status: options.BedAllotmentStatus.VACCANT }],
      attributes: ['id', 'clinic_id', 'room_number', 'status'],
      group: ["room_number"]
    }
    const response = await commonServices.getAll(Beds, query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Room number"), data: response })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// view doctor all speciality dropdown
exports.doctorSpecialityListing = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const query = {
      where: [{ doctor_id: doctorId }],
      attributes: ['id', 'speciality_id',],
      include: [
        { model: Speciality, as: "specialities", attributes: ["id", "name"] }
      ]
    }
    const response = await commonServices.getAll(DoctorSpecialities, query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Doctor speciality"), data: response })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// view patient all insurance dropdown
exports.getPatientInsurance = async (req, res) => {
  try {
    const patientId = req.params.id;

    let query = {
      where: [{ patient_id: patientId }],
      attributes: ['id', 'patient_id', 'policy_name', 'policy_number', 'company_name', 'insurance_type', 'max_amount', 'policy_doc'],
    };

    let data = await commonServices.getAll(PatientInsurances, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Insurance"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This insurance") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// add(assign) nurse
exports.assignPatientNurse = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;
    const user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = user.patient_id;

    const staffData = await commonServices.get(ClinicStaffs, { where: { id: req.body.staff_id } })
    if (!staffData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient nurse") })
    }
    const staffUserId = staffData.user_id;

    const userData = await commonServices.get(User, { where: { id: staffUserId } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }
    const fullName = userData.full_name

    // const query = {
    //   where: [/* { staff_id: req.body.staff_id } */, { present_days: { [Op.ne]: [req.body.present_days] } }, { start_time: { [Op.between]: [req.body.start_time, req.body.end_time] } }]
    // }
    // const isExist = await commonServices.get(PatientAssignNurses, query)

    const obj = req.body.present_days.map(item => {
      return {
        clinic_id: clinicId,
        patient_id: patientId,
        staff_id: req.body.staff_id,
        name: fullName,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        present_days: item,
        createdBy: userId,
      }
    })

    await commonServices.bulkCreate(PatientAssignNurses, obj)

    const payload = fcmNotificationPayload.clinicAssignNurseToPateint({ userId: staffUserId })
    await sendAllNotification.sendAllNotification({ payload })

    return res.status(200).json({ success: "true", message: message.ADD_DATA("Patient nurse") })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// // view patient assign nurse
// exports.getPatientAssignAllNurse = async (req, res) => {
//   try {
//     const patientId = req.params.id;
//     const clinicId = req.user.clinics.id;
//     console.log(clinicId);

//     const query = {
//       where: [{ clinic_id: clinicId }, { patient_id: patientId }],
//       attributes: ["staff_id", "name", "start_time", "end_time", "present_days"],
//       // group: ['staff_id']
//     }

//     const data = await commonServices.getAll(PatientAssignNurses, query)
//     // let grouped_data = _.groupBy(data, 'staff_id')
//     // console.log(grouped_data);

//     const abc = _(data).groupBy(a => a.staff_id)
//       .map((value, key) => ({ staff_id: key, value: value }))
//       .value();

//     return res.status(200).json({ success: "true", message: message.GET_DATA("Patient nurse"), data: abc })
//   } catch (error) {
//     return res.status(200).json({ success: "false", message: error.message })
//   }
// }



// exports.getPatientAssignAllNurse = async (req, res) => {
//   try {
//     const patientId = req.params.id;
//     const clinicId = req.user.clinics.id;
//     // console.log(clinicId);

//     const query = {
//       where: [{ clinic_id: clinicId }, { patient_id: patientId }],
//       attributes: ["staff_id", "name", "start_time", "end_time", "present_days"],
//     };

//     const data = await commonServices.getAll(PatientAssignNurses, query);

//     // Group the data by staff_id
//     const groupedData = _.groupBy(data, 'staff_id');
//     // console.log(groupedData, "---------------------");
//     // console.log(groupedData[0], "---------------------");

//     // Transform the grouped data into an array
//     const result = Object.keys(groupedData).map(staff_id => {
//       console.log(staff_id);
//       return {
//         staff_id: parseInt(staff_id), // Convert staff_id to integer if needed
//         name: groupedData.name,
//         data: groupedData[staff_id],
//       };
//     });

//     console.log(data,"----------------------fslkefgokmvokgoi");
//     result.name = data[0].patient_assign_nurses.name
//     console.log(result,"----------------------fslkefgokmvokgoi");


//     return res.status(200).json({ success: "true", message: message.GET_DATA("Patient nurse"), data: result });
//   } catch (error) {
//     return res.status(200).json({ success: "false", message: error.message });
//   }
// };


// view patient assign nurse
exports.getPatientAssignAllNurse = async (req, res) => {
  try {
    const patientId = req.params.id;
    const clinicId = req.user.clinics.id;

    const query = {
      where: [{ clinic_id: clinicId }, { patient_id: patientId }],
      attributes: ["staff_id", "name", "start_time", "end_time", "present_days"],
    };

    const data = await commonServices.getAll(PatientAssignNurses, query);

    // Group the data by staff_id, name, startTime, and endTime
    const groupedData = _.groupBy(data, d => `${d.staff_id}_${d.name}_${d.start_time}_${d.end_time}`);

    // Transform the grouped data into an array
    const result = Object.keys(groupedData).map(groupKey => {
      const [staff_id, name, startTime, endTime] = groupKey.split('_');
      return {
        staff_id: parseInt(staff_id),
        name: name,
        startTime: startTime,
        endTime: endTime,
        present_days: groupedData[groupKey].map(item => item.present_days),
      };
    });

    return res.status(200).json({ success: "true", message: message.GET_DATA("Patient nurse"), data: result });
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};




