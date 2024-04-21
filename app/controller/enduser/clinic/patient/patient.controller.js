const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const emailTmplateServices = require("../../../../services/email_template")
const sendAllNotification = require("../../../../services/settings");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const message = require("../../message");
const options = require('../../../../config/options');
const { where } = require("sequelize");
const { constant } = require("lodash");
const Op = db.Sequelize.Op;


const User = db.users;
const Cities = db.cities;
const Areas = db.areas;
const UserDetails = db.user_details;
const Appointments = db.appointments;
const Specialities = db.specialities;
const AppointmentRequests = db.appointment_requests;
const Patients = db.patients;
const PatientsSugar = db.patient_sugars;
const PatientsHeartRates = db.patient_heart_rates;
const PatientsHeightWeights = db.patient_height_weights;
const PatientsUrineOutputs = db.patient_urine_outputs;
const PatientsBloodPressures = db.patient_blood_pressures;
const PatientInsurances = db.patient_insurances;


// get patient list(By OPD, IPD)
exports.getPatientList = async (req, res) => {
  try {
    const clinicId = req.user.clinics.id;
    const status = req.query.status;
    const { page, size, s } = req.query;

    const data = await consultationServices.getOpdIpdList({ status, clinicId, page, size, s })

    if (data.length != 0) {
      return res.status(200).json({ success: "true", message: message.GET_LIST("Appointment"), data: data })
    } else {
      return res.status(200).json({ success: "true", message: message.NO_DATA("Appointment") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// get patients health recoards
exports.getHealthRecoards = async (req, res) => {
  try {
    const clinicId = req.user.clinics.id
    const { page, size, s } = req.query;

    const data = await consultationServices.getPatientHealthRecoards({ clinicId, page, size, s })
    if (data) {
      return res.status(200).json({ success: "true", message: message.GET_LIST("Appointment"), data: data })
    } else {
      return res.status(200).json({ success: "true", message: message.NO_DATA("Appointment") })
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add new patient
exports.addPatient = async (req, res) => {
  try {
    const adminId = req.user.id;
    const clinicId = [req.user.clinics.id];
    const doctorId = req.body.doctor_id;
    const status = req.body.status;

    let isPincodeExist = await pincodeExist(req.body.pincode);
    if (isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") });
    }

    const isEmailExists = await commonServices.get(User, { where: { email: req.body.email } });
    if (isEmailExists) {

      const isPhoneExists = await commonServices.get(User, { where: { phone_no: req.body.phone_no } });
      if (isPhoneExists) {

        const userId = isPhoneExists.id;
        const user = await commonServices.get(Patients, { where: { user_id: userId } })
        if (user) {
          return res.status(200).json({ success: "false", message: message.DATA_EXIST("Patient email") })
        }

        const t = await db.sequelize.transaction()
        try {
          const isPatientExist = await commonServices.get(Patients, { where: { user_id: isEmailExists.id } })
          if (isPatientExist) {
            var patientData = await contentServices.updatePatientProfile({ userId, adminId, ...req.body }, t);
            var userData = await contentServices.updateUserProfile({ userId, adminId, roleId: 3, ...req.body }, t);
          } else {
            var patientData = await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t);
          }
          const patientId = patientData.id;
          await contentServices.createOrUpdateUserInsurance({ userId, patientId, ...req.body }, t)
          await t.commit();
          const appointmentData = await consultationServices.admitNewPatientAppointment(req, res, userId, patientId, clinicId, doctorId, adminId);
          const appointmentId = appointmentData.id;

          if (status == "ipd") {
            await contentServices.assignBeds({ userId, adminId, clinicId, appointmentId, ...req.body });
          }
          await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId });
          await commonServices.update(Appointments, { where: { id: appointmentId } }, { doctor_id: doctorId, clinic_id: clinicId });
          await commonServices.update(AppointmentRequests, { where: { appointment_id: appointmentId, patient_id: patientId } }, { doctor_id: doctorId, clinic_id: clinicId });
          const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
          await sendAllNotification.sendAllNotification({ email: req.body.email, context })

          return res.status(200).json({ success: "true", message: message.ADD_DATA("Patient") });
        } catch (error) {
          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message });
        }
      } else {
        return res.status(200).json({ success: "false", message: message.DATA_EXIST("Patient email") })
      }
    } else {

      const isPhoneExists = await commonServices.get(User, { where: { phone_no: req.body.phone_no } });
      if (isPhoneExists) {
        return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Patient") });
      }

      const t = await db.sequelize.transaction()
      try {

        const slug = await commonServices.generateSlug(req.body.full_name);
        let userData = await contentServices.createUserProfile({ slug, adminId, ...req.body }, t);
        let userId = userData.user.id;
        const patientData = await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t);
        const patientId = patientData.id

        await contentServices.createOrUpdateUserInsurance({ userId, patientId, ...req.body }, t)

        await t.commit()
        const appointmentData = await consultationServices.admitNewPatientAppointment(req, res, userId, patientId, clinicId, doctorId, adminId);
        const appointmentId = appointmentData.id;
        if (status == "ipd") {
          await contentServices.assignBeds({ userId, adminId, clinicId, appointmentId, ...req.body },);
        }
        await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId });
        await commonServices.update(Appointments, { where: { id: appointmentId } }, { doctor_id: doctorId, clinic_id: clinicId });
        await commonServices.update(AppointmentRequests, { where: { appointment_id: appointmentId, patient_id: patientId } }, { doctor_id: doctorId, clinic_id: clinicId });
        const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
        await sendAllNotification.sendAllNotification({ email: req.body.email, context })

        return res.status(200).json({ success: "true", message: message.ADD_DATA("Patient") });

      } catch (error) {
        console.log(error);
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message });
      }

    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// update patient by id
exports.updatePatientById = async (req, res) => {
  try {
    const adminId = req.user.id;
    const appointmentId = req.params.id;
    const clinicId = req.user.clinics.id;

    const patientData = await commonServices.get(Appointments, { where: { id: appointmentId } })
    const patientId = patientData.patient_id;

    const user = await commonServices.get(Patients, { where: { id: patientId } })
    console.log(user, "user user user user user");
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
    }
    const userId = user.user_id;

    let isPincodeExist = await pincodeExist(req.body.pincode);
    if (isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
    }

    const t = await db.sequelize.transaction()
    try {

      await contentServices.updateUserProfile({ adminId, userId, roleId: 3, ...req.body }, t);
      const user = await commonServices.get(Patients, { where: { user_id: userId } })
      if (user) {
        const patientId = user.id;
        const uniqueId = user.unique_id;
        await contentServices.updatePatientProfile({ adminId, userId, unique_id: uniqueId, ...req.body }, t);
        await contentServices.createOrUpdateUserInsurance({ adminId, patientId, ...req.body }, t);
        const obj = {
          type: req.body.type,
          problem_info: req.body.problem_info,
          speciality_id: req.body.speciality_id,
          status: req.body.status,
        }
        await commonServices.update(Appointments, { where: { id: appointmentId } }, obj, { transaction: t })
        const obj2 = {
          type: req.body.type,
          speciality_id: req.body.speciality_id,
          status: req.body.status,
        }
        await commonServices.update(AppointmentRequests, { where: [{ appointment_id: appointmentId }, { clinic_id: clinicId }, { patient_id: patientId }] }, obj2, { transaction: t })
      }

      await t.commit()
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Patient profile") })

    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    return res.status(200).json({ success: 'false', message: error.message });
  }

};

// view patient by id
exports.viewPatientById = async (req, res) => {

  try {
    const appointmentId = req.params.id;
    // const clinicId = req.user.clinics.id;

    let user = await commonServices.get(Appointments, { where: { id: appointmentId } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Appointment") });
    }

    const query = {
      where: [{ id: appointmentId, }],
      attributes: ["id", "patient_id", "slot_timing", "type", "status", "problem_info", "speciality_id",],
      include: [
        { model: Specialities, as: 'specialitydata', attributes: ['id', 'name'] },
        {
          model: Patients, as: "patientdata", required: false, attributes: ["id", "user_id", "unique_id", "gender", "age", "relationship", "reward_balance", "cash_balance", "has_insurance", "full_name", "email", "countryCode", "phone_no", "address1", "address2", "pincode", "gender", "age", "profile_image",],
          include: [
            { model: PatientInsurances, as: "patient_insurance", required: false, attributes: ["id", "policy_name", "policy_number", "company_name", "insurance_type", "max_amount", "policy_doc"] },
            {
              model: User, as: 'usersData', attributes: ["id", "email", "slug", "countryCode", "phone_no", "profile_image", "createdAt"],
              include: [
                {
                  model: UserDetails, as: "user_details", attributes: ["address1", "address2"],
                  include: [
                    {
                      model: Areas, as: "areas", attributes: ["pincode"],
                      include: [
                        { model: Cities, as: "cities", attributes: ["city_name", "state_name", "country_name"] },
                      ]
                    },
                  ]
                },
              ]
            },
          ]
        }
      ]

    };

    const data = await commonServices.get(Appointments, query);

    if (data != null) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Patient profile"), data: data })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") })
    }

  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: " false", message: error.message })
  }

}

// add patient sugar
exports.addPatientSugar = async (req, res) => {
  try {
    const userId = req.user.id;
    const obj = {
      appointment_id: req.body.appointment_id,
      patient_id: req.body.patient_id,
      date: req.body.date,
      time: req.body.time,
      sugar: req.body.sugar,
      diastolic: req.body.diastolic,
      createdBy: userId,
    }

    const data = await commonServices.create(PatientsSugar, obj)
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Sugar') })
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view patient sugar
exports.viewPatientAllSugar = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { page, size, s } = req.query

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { "$patient_sugars.date$": { [Op.like]: `%${s}%` } },
          { "$patient_sugars.time$": { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj, { appointment_id: appointmentId }],
      attributes: ['id', 'appointment_id', 'patient_id', 'date', 'time', 'sugar', 'diastolic']
    }

    const { limit, offset } = commonServices.getPagination(page, size)
    const responseData = await commonServices.getAndCountAll(PatientsSugar, query, limit, offset)
    const getPagingData = commonServices.getPagingData(responseData, page, limit)
    const response = JSON.parse(JSON.stringify(getPagingData))
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Sugar'), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add patient heart rate
exports.addPatientHeartRate = async (req, res) => {
  try {
    const userId = req.user.id;
    const obj = {
      appointment_id: req.body.appointment_id,
      patient_id: req.body.patient_id,
      date: req.body.date,
      time: req.body.time,
      bpm: req.body.bpm,
      createdBy: userId,
    }

    const data = await commonServices.create(PatientsHeartRates, obj)
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Heart rate') })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view patient heart rate
exports.viewPatientAllHeartrate = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { page, size, s } = req.query

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { "$patient_heart_rates.date$": { [Op.like]: `%${s}%` } },
          { "$patient_heart_rates.time$": { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj, { appointment_id: appointmentId }],
      attributes: ['id', 'appointment_id', 'patient_id', 'date', 'time', 'bpm']
    }

    const { limit, offset } = commonServices.getPagination(page, size)
    const responseData = await commonServices.getAndCountAll(PatientsHeartRates, query, limit, offset)
    const getPagingData = commonServices.getPagingData(responseData, page, limit)
    const response = JSON.parse(JSON.stringify(getPagingData))
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Heart rate'), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add patient heaight & weight
exports.addPatientHeightWeight = async (req, res) => {
  try {
    const userId = req.user.id;
    const obj = {
      appointment_id: req.body.appointment_id,
      patient_id: req.body.patient_id,
      date: req.body.date,
      time: req.body.time,
      weight: req.body.weight,
      height: req.body.height,
      createdBy: userId,
    }

    await commonServices.create(PatientsHeightWeights, obj)
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Height & weight') })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view patient heaight & weight
exports.viewPatientAllHeightWeight = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { page, size, s } = req.query

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { "$patient_height_weights.date$": { [Op.like]: `%${s}%` } },
          { "$patient_height_weights.time$": { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj, { appointment_id: appointmentId }],
      attributes: ['id', 'appointment_id', 'patient_id', 'date', 'time', 'weight', 'height']
    }

    const { limit, offset } = commonServices.getPagination(page, size)
    const responseData = await commonServices.getAndCountAll(PatientsHeightWeights, query, limit, offset)
    const getPagingData = commonServices.getPagingData(responseData, page, limit)
    const response = JSON.parse(JSON.stringify(getPagingData))
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Height & weight'), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add patient urine output
exports.addPatientUrinOutput = async (req, res) => {
  try {
    const userId = req.user.id;
    const obj = {
      appointment_id: req.body.appointment_id,
      patient_id: req.body.patient_id,
      date: req.body.date,
      time: req.body.time,
      urine_output: req.body.urine_output,
      createdBy: userId,
    }

    await commonServices.create(PatientsUrineOutputs, obj)
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Urine output') })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view patient urine output
exports.viewPatientAllUrineOutput = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { page, size, s } = req.query

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { "$patient_urine_outputs.date$": { [Op.like]: `%${s}%` } },
          { "$patient_urine_outputs.time$": { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj, { appointment_id: appointmentId }],
      attributes: ['id', 'appointment_id', 'patient_id', 'date', 'time', 'urine_output']
    }

    const { limit, offset } = commonServices.getPagination(page, size)
    const responseData = await commonServices.getAndCountAll(PatientsUrineOutputs, query, limit, offset)
    const getPagingData = commonServices.getPagingData(responseData, page, limit)
    const response = JSON.parse(JSON.stringify(getPagingData))
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Urine output'), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add patient blood pressure
exports.addPatientBloodPressure = async (req, res) => {
  try {
    const userId = req.user.id;
    const obj = {
      appointment_id: req.body.appointment_id,
      patient_id: req.body.patient_id,
      date: req.body.date,
      time: req.body.time,
      systolic: req.body.systolic,
      diastolic: req.body.diastolic,
      createdBy: userId,
    }

    await commonServices.create(PatientsBloodPressures, obj)
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Blood pressure') })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view patient blood pressure
exports.viewPatientAllBloodPressure = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const { page, size, s } = req.query

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { "$patient_blood_pressures.date$": { [Op.like]: `%${s}%` } },
          { "$patient_blood_pressures.time$": { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj, { appointment_id: appointmentId }],
      attributes: ['id', 'appointment_id', 'patient_id', 'date', 'time', 'systolic', 'diastolic']
    }

    const { limit, offset } = commonServices.getPagination(page, size)
    const responseData = await commonServices.getAndCountAll(PatientsBloodPressures, query, limit, offset)
    const getPagingData = commonServices.getPagingData(responseData, page, limit)
    const response = JSON.parse(JSON.stringify(getPagingData))
    return res.status(200).json({ success: 'true', message: message.ADD_DATA('Height & weight'), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

