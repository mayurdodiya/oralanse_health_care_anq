const db = require("../../../models");
const jwt = require("jsonwebtoken");
const config = require("../../../config/config.json");
const commonConfig = require("../../../config/common.config");
const emailService = require("../../../services/email");
const adminServices = require("../service");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content")
const emailTmplateServices = require("../../../services/email_template")
const sendAllNotification = require("../../../services/settings");
const uploadService = require("../../../services/uploadFile");
const message = require("../message");
const commonResponse = require("./common.response");
const options = require("../../../config/options");
const excel = require("exceljs");
const moment = require("moment");
const Op = db.Sequelize.Op;

const Areas = db.areas
const AppointmentRequests = db.appointment_requests;
const Appointments = db.appointments;
const Languages = db.languages;
const User = db.users;
const UserDetails = db.user_details;
const UserSubRoles = db.user_subroles;
const EnduserAssignRoles = db.enduser_assign_roles;
const Patient = db.patients;
const PatientInsurances = db.patient_insurances;
const PrescriptionDocuments = db.prescription_documents;
const PatientTreatments = db.patient_treatments;

const Cities = db.cities;
const Clinics = db.clinics;
const ClinicTreatments = db.clinic_treatments;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const Doctors = db.doctors;
const DoctorSpecialities = db.doctor_specialities;
const Treatments = db.treatments;
const Specialities = db.specialities;



// add patient
exports.addPatient = async (req, res) => {
  try {
    const adminId = req.user.id;

    let isPincodeExist = await pincodeExist(req.body.pincode);
    if (isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") });
    }

    const isEmailExists = await commonServices.get(User, { where: { email: req.body.email } });
    if (isEmailExists) {

      const isPhoneExists = await commonServices.get(User, { where: { phone_no: req.body.phone_no } });
      if (isPhoneExists) {

        const userId = isPhoneExists.id;
        const user = await commonServices.get(Patient, { where: { user_id: userId } })
        if (user) {
          return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Patient") })
        }

        const t = await db.sequelize.transaction()
        try {
          await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t);
          await t.commit()
          await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId });

          const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
          await sendAllNotification.sendAllNotification({ email: req.body.email, context })
          return res.status(200).json({ success: "true", message: message.ADD_DATA("Patient") });
        } catch (error) {

          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message });
        }
      } else {
        return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Patient") })
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
        await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t);

        await t.commit()
        await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId });
        const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
        await sendAllNotification.sendAllNotification({ email: req.body.email, context })
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Patient") });

      } catch (error) {
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

    const slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
    }

    const userId = user.id;

    let isEmailExisting = await adminServices.uniqueEmailUpdate(userId, req.body.email);
    if (!isEmailExisting) {
      return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Patient") })
    }

    let isMobileExisting = await adminServices.uniquePhoneUpdate(req.body.phone_no, userId);
    if (!isMobileExisting) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Patient") })
    }

    let isPincodeExist = await pincodeExist(req.body.pincode);
    if (isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
    }

    const t = await db.sequelize.transaction()
    try {

      await contentServices.updateUserProfile({ adminId, userId, roleId: 3, ...req.body }, t);
      const user = await commonServices.get(Patient, { where: { user_id: userId } })
      if (user) {
        const uniqueId = user.unique_id
        await contentServices.updatePatientProfile({ adminId, userId, unique_id: uniqueId, ...req.body }, t);
      }

      await t.commit()
      const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
      await sendAllNotification.sendAllNotification({ email: req.body.email, context })
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Patient profile") })

    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }


  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// delete patient by id desicion hold pr che
exports.deletePatientById = async (req, res) => {
  try {

    const slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
    }

    const userId = user.id;
    let patientData = await commonServices.get(Patient, { where: { user_id: userId } })
    if (!patientData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
    }
    const patientId = patientData.id;

    const t = await db.sequelize.transaction()
    try {

      await contentServices.deleteUserProfile({ userId, patientId }, t);
      const userDelete = await contentServices.deletePatientProfile({ userId, patientId }, t)
      //
      if (userDelete) {
        await t.commit()
        return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Patient profile") })
      } else {
        res.status(200).json({ success: "false", message: message.NOT_DELETED("Patient profile") });
      }

    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: 'false', message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }
};

// view patient by id
exports.viewPatientById = async (req, res) => {

  try {
    const slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
    }

    const query = {
      where: { slug: slug, role_id: 3 },
      attributes: ["id", "full_name", "email", "countryCode", "phone_no", "profile_image", "createdAt"],
      include: [
        {
          model: UserDetails, as: "user_details", attributes: ["gender", "address1", "address2"],
          include: [
            {
              model: Areas, as: "areas", attributes: ["pincode"],
              include: [
                { model: Cities, as: "cities", attributes: ["city_name", "state_name", "country_name"] },
              ]
            },
          ]
        },
        { model: Patient, as: "patients", required: false, attributes: [/* "id", */ "user_id", "unique_id", "gender", "age", "relationship", "reward_balance", "cash_balance", "has_insurance"], }
      ]
    };

    const data = await commonServices.get(User, query);
    const creationTime = data.createdAt
    const response = commonResponse.logResponse(data, creationTime)

    if (data != null) {
      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Patient profile"),
        data: response
        // data: data
      })
    } else {
      res.status(200).json({
        success: "false",
        message: message.NO_DATA("Patient profile")
      })
    }


  } catch (error) {
    res.status(200).json({
      success: " false",
      message: error.message
    })
  }

};

// view all patient
exports.viewAllPatient = async (req, res) => {

  try {

    const { page, size, s } = req.query;
    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { unique_id: { [Op.like]: `%${s}%` } },

          { '$usersData.full_name$': { [Op.like]: `%${s}%` } },
          { '$usersData.email$': { [Op.like]: `%${s}%` } },
          { '$usersData.slug$': { [Op.like]: `%${s}%` } },
          { '$usersData.phone_no$': { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    const query = {
      where: [DataObj],
      attributes: ["id", "unique_id", "createdAt"],
      include: [
        { model: User, as: "usersData", attributes: ["id", "slug", "full_name", "email", "countryCode", "phone_no", "profile_image", "is_active"], },
      ]
    }

    let data = await commonServices.getAndCountAll(Patient, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Patient profile"),
        data: responseData
      });

    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") })
    }


  } catch (error) {
    res.status(200).json({
      success: " false",
      message: error.message
    })
  }

};

// create the excel file from database
exports.exportPatientDetailsInExcel = async (req, res) => {
  try {
    const user = req.user;
    const timeDate = Date.now();
    const filename = `Patient-${timeDate}.xlsx`

    const query = {
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ["full_name", "unique_id", "email", "countryCode", "phone_no", "gender", "age", "createdAt"],
      include: [{ model: User, as: "usersData" }]
    }

    const patientData = await commonServices.getAll(Patient, query)
    const responseData = JSON.parse(JSON.stringify(patientData));
    if (responseData.length != 0) {
      let objs = responseData
      objs = objs.map(i => {
        return {
          full_name: i.full_name,
          unique_id: i.unique_id,
          phone_no: `${i.countryCode}${i.phone_no}`,
          email: i.email,
          createdAt: moment(i.createdAt).format(options.DateFormat.DATETIME),
          is_active: i.usersData.is_active,
          gender: i.gender != null ? i.gender : "",
          age: i.age != null ? i.age : ""
        }
      })

      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("patient");
      worksheet.columns = [
        { header: "UniqueId", key: "unique_id", width: 20 },
        { header: "Name", key: "full_name", width: 20 },
        { header: "Gender", key: "gender", width: 20 },
        { header: "Age", key: "age", width: 20 },
        { header: "Phone No", key: "phone_no", width: 20 },
        { header: "Email", key: "email", width: 20 },
        { header: "CreatedAt", key: "createdAt", width: 30 },
        { header: "Status", key: "is_active", width: 20 }
      ];
      worksheet.addRows(objs);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}`
      );

      workbook.xlsx.write(res).then(() => {
        res.end()
      });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("User's data") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// active/incative patient status
exports.updatePatientStatus = async (req, res) => {
  try {
    const roleId = 3;
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Patient") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Patient") });
    } else {
      const status = true
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Patient") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};

// view patient appointment history
exports.viewAppointmentHistory = async (req, res) => {
  try {
    const slug = req.params.slug;

    const query = {
      where: { slug: slug },
      attributes: ["full_name", "profile_image"],
      include: [
        {
          model: Patient, as: "patients", attributes: ["unique_id"],
          include: [
            { model: Appointments, as: "appointments", attributes: ["problem_info", "slot_timing"] }
          ]
        }
      ]
    }

    const user = await commonServices.get(User, query);

    if (user) {
      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Patient"),
        data: user
      });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Patient") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};

// view presciption details
exports.viewPresciptionDetails = async (req, res) => {
  try {
    const slug = req.params.slug;


    const query = {
      where: { slug: slug },
      attributes: ["id"],
      include: [
        {
          model: Patient, as: "patients", attributes: ["id", "unique_id"],
          include: [
            {
              model: PatientTreatments, as: "patient_treatments", required: false, attributes: ["treatment_id"],
              include: [
                { model: Treatments, as: "treatments", required: false, attributes: ["name"] }
              ]
            },
            { model: PrescriptionDocuments, as: "prescription_documents", required: false, attributes: ["doc_path"] },
            {
              model: Appointments, as: "appointments", required: false, attributes: ["doctor_id", "patient_id", "problem_info"],
              include: [
                {
                  model: Doctors, as: "doctors", required: false, attributes: ["id"],
                  include: [
                    { model: User, as: "users", required: false, attributes: ["full_name", "phone_no"], },
                    {
                      model: DoctorSpecialities, as: "doctor_specialities", required: false, attributes: ["speciality_id"],
                      include: [
                        { model: Specialities, as: "specialities", required: false, attributes: ["name"] },
                      ]
                    },
                  ]
                },
              ]
            },
          ]
        },
      ]
    }

    const user = await commonServices.get(User, query)

    if (user) {
      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Patient profile"),
        data: user
      });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};