const db = require("../../../models");
const AWS = require('aws-sdk');
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const commonResponse = require("./common.response");
const message = require("../../admin/message");
const commonConfig = require("../../../config/common.config");
const emailService = require("../../../services/email");
const uploadService = require("../../../services/uploadFile");
const adminServices = require("../service");
const { methods: contentServices } = require("../../../services/content");
const config = require("../../../config/config.json");
const jwt = require("jsonwebtoken");
const excel = require("exceljs");
const Op = db.Sequelize.Op;
const doctorCommonServices = require("./common.services");
const { uploadtos3S3 } = require("../../../services/uploadFile");
const uploadFileServices = require("../../../services/uploadFile");
const moment = require("moment");
const options = require("../../../config/options");
const emailTmplateServices = require("../../../services/email_template")
const sendAllNotification = require("../../../services/settings");
const fcmNotificationPayload = require("../../../services/fcm_notification_payload");


const User = db.users;
const UserDetails = db.user_details;
const UserSubRoles = db.user_subroles;
const EnduserAssignRoles = db.enduser_assign_roles;
const Languages = db.languages;
const Degrees = db.degrees;
const Colleges = db.colleges;
const Areas = db.areas;
const Cities = db.cities;
const Doctors = db.doctors;
const DoctorRegistrationDetails = db.doctor_registration_details;
const DoctorTimings = db.doctor_timings;
const DoctorsEducations = db.doctor_educations;
const DoctorSpecialities = db.doctor_specialities;
const Clinics = db.clinics;
const ClinicTimings = db.clinic_timings;
const ClinicSpecialities = db.clinic_specialities;
const ClinicFacilities = db.clinic_facilities;
const ClinicTreatments = db.clinic_treatments;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const Treatments = db.treatments;
const Facilities = db.facilities;
const Specialities = db.specialities;
const HospitalAdmin = db.hospital_admins;
const Patient = db.patients;
const Roles = db.roles;





// add doctors
exports.addDoctors = async (req, res) => {
  try {
    const adminId = req.user.id;
    let isPincodeExist = await pincodeExist(req.body.pincode);
    if (isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") });
    }
    let role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
    if (!role) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor role") });
    }
    let doctorRoleId = role.id;

    const isEmailExists = await commonServices.get(User, { where: { email: req.body.email.toLowerCase() } });
    if (isEmailExists) {

      const isPhoneExists = await commonServices.get(User, { where: { phone_no: req.body.phone_no } });
      if (isPhoneExists) {

        const userId = isPhoneExists.id;
        const t = await db.sequelize.transaction()
        try {

          const user = await commonServices.get(Patient, { where: { user_id: userId } })
          if (!user) {
            await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t)
          }
          const userData = await commonServices.get(Doctors, { where: { user_id: userId } })
          if (!userData) {
            let doctorData = await contentServices.addDoctor({ adminId, userId, doctorRoleId, ...req.body, document_path: req.body.registration_document_path }, t)
            let doctorId = doctorData.doctor.id;
            if (req.body.is_clinic_data == true) {
              let isclinicPhoneUnique = await adminServices.clinicPhoneExist(req.body.clinic_phone_number)
              if (isclinicPhoneUnique == true) {

                if (req.body.clinic_pincode != null) {
                  let isClinicPincodeExist = await pincodeExist(req.body.clinic_pincode);
                  if (isClinicPincodeExist) {
                    return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic pincode") })
                  }
                }

                const clinicData = await contentServices.addClinic({ adminId, userId, ...req.body, pincode: req.body.clinic_pincode, location: req.body.clinic_location, latitude: req.body.clinic_latitude, longitude: req.body.clinic_longitude, consultation_fees: req.body.clinic_consultation_fees, document_type: req.body.clinic_document_type, home_visit: req.body.clinic_home_visit }, t)
                const clinicId = clinicData.addClinics.id;
                await contentServices.addClinicDoctorRelation({ adminId, clinicId, doctorId, }, t)
                await contentServices.addHospitalAdmin({ adminId, userId, doctorId, proof_type: req.body.document_type, identity_proof_doc_path: req.body.front_side_document }, t)

                await t.commit()
                await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
                const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
                await sendAllNotification.sendAllNotification({ email: req.body.email, context })

                return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") })


              } else {
                const query = { where: { clinic_phone_number: req.body.clinic_phone_number } }
                const clinic = await commonServices.get(Clinics, query)
                const clinicId = clinic.id

                let isRelationUnique = await contentServices.clinicDoctorRelationUnique(clinic.id, doctorId)

                if (isRelationUnique) {

                  await contentServices.addClinicDoctorRelation({ adminId, doctorId, clinicId }, t)
                  await t.commit()
                  await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
                  const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
                  await sendAllNotification.sendAllNotification({ email: req.body.email, context })
                  return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });

                } else {

                  await t.commit()

                  const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
                  await sendAllNotification.sendAllNotification({ email: req.body.email, context })
                  await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
                  return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });
                }
              }
            } else {
              await t.commit()
              const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
              await sendAllNotification.sendAllNotification({ email: req.body.email, context })
              await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
              return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });
            }
          } else {
            return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Doctor") })
          }

        } catch (error) {
          console.log(error);
          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message });
        }

      } else {
        return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Doctor") });
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

        let doctorData = await contentServices.addDoctor({ adminId, userId, doctorRoleId, ...req.body, document_path: req.body.registration_document_path }, t)
        let doctorId = doctorData.doctor.id;
        // add clinic
        if (req.body.is_clinic_data == true) {
          let isclinicPhoneUnique = await adminServices.clinicPhoneExist(req.body.clinic_phone_number)
          if (isclinicPhoneUnique == true) {

            if (req.body.clinic_pincode != null) {
              let isClinicPincodeExist = await pincodeExist(req.body.clinic_pincode);
              if (isClinicPincodeExist) {
                return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic pincode") })
              }
            }

            const clinicData = await contentServices.addClinic({ adminId, userId, ...req.body, pincode: req.body.clinic_pincode, location: req.body.clinic_location, latitude: req.body.clinic_latitude, longitude: req.body.clinic_longitude, consultation_fees: req.body.clinic_consultation_fees, document_type: req.body.clinic_document_type, home_visit: req.body.clinic_home_visit }, t)
            const clinicId = clinicData.addClinics.id;
            await contentServices.addClinicDoctorRelation({ adminId, clinicId, doctorId, }, t)
            await contentServices.addHospitalAdmin({ adminId, userId, doctorId, proof_type: req.body.document_type, identity_proof_doc_path: req.body.front_side_document }, t)

            await t.commit()
            await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
            const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
            await sendAllNotification.sendAllNotification({ email: req.body.email, context })
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") })


          } else {
            const query = { where: { clinic_phone_number: req.body.clinic_phone_number } }
            const clinic = await commonServices.get(Clinics, query)
            const clinicId = clinic.id

            let isRelationUnique = await contentServices.clinicDoctorRelationUnique(clinic.id, doctorId)

            if (isRelationUnique) {

              await contentServices.addClinicDoctorRelation({ adminId, doctorId, clinicId }, t)
              await t.commit()
              await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
              const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
              await sendAllNotification.sendAllNotification({ email: req.body.email, context })
              return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });

            } else {

              await t.commit()

              const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
              await sendAllNotification.sendAllNotification({ email: req.body.email, context })
              await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
              return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });
            }
          }
        }
        await t.commit()
        const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
        await sendAllNotification.sendAllNotification({ email: req.body.email, context })
        await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });
        
      } catch (error) {
        console.log(error);
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message });
      }

    }

  } catch (error) {
    console.log(error);
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// update doctors
exports.updateDoctorsById = async (req, res) => {
  try {
    const adminId = req.user.id;
    const slug = req.params.slug;
    const clinicId = req.body.clinic_id

    const user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const userId = user.id;

    const userData = await commonServices.get(Doctors, { where: { user_id: userId } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const doctorId = userData.id

    let isDoctorClinicExist = await commonServices.get(ClinicDoctorRelations, { where: { doctor_id: doctorId, clinic_id: clinicId } })
    if (!isDoctorClinicExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor and clinic") });
    }

    const role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
    if (!role) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const userRoleId = role.id;

    const isUserRole = await commonServices.verifyUserSubRole(userId, userRoleId)
    if (!isUserRole) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
    }
    let isEmailExisting = await adminServices.uniqueEmailUpdate(userId, req.body.email);

    if (!isEmailExisting) {
      return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Doctor") })
    }
    let isMobileExisting = await adminServices.uniquePhoneUpdate(req.body.phone_no, userId);

    if (!isMobileExisting) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Doctor") })
    }

    if (req.body.pincode != null) {
      let isPincodeExist = await pincodeExist(req.body.pincode);
      if (isPincodeExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
      }
    }

    let isClinicMobileExist = await adminServices.uniqueClinicPhoneUpdate(req.body.clinic_phone_number, clinicId)
    if (!isClinicMobileExist) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Clinic") })
    }

    const t = await db.sequelize.transaction()
    try {
      await contentServices.updateUserProfile({ adminId, userId, roleId: userRoleId, ...req.body }, t);
      const user = await commonServices.get(Patient, { where: { user_id: userId } })
      if (user) {
        const uniqueId = user.unique_id
        await contentServices.updatePatientProfile({ adminId, userId, unique_id: uniqueId, ...req.body }, t);
      }
      await contentServices.updateDoctorProfile({ adminId, userId, doctorId, ...req.body }, t);
      await contentServices.updateClinic({ adminId, clinicId, ...req.body }, t);
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Doctor profile") })
    } catch (error) {

      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

exports.deleteDoctorsById = async (req, res) => {
  try {
    const slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User profile") });
    }
    const role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
    const userRoleId = role.id;
    const userId = user.id;

    const isUserRole = await commonServices.verifyUserSubRole(userId, userRoleId)
    if (!isUserRole) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
    } else {

      const doctor = await commonServices.get(Doctors, { where: { user_id: userId } })
      const doctorId = doctor.id;
      const t = await db.sequelize.transaction();
      try {
        const doctorData = await contentServices.deleteDoctorProfile({ userId, doctorId, userRoleId }, t)
        if (doctorData) {
          const getClinic = await commonServices.get(Clinics, { where: { user_id: userId } });
          if (getClinic != null) {
            const clinicId = getClinic.id;
            await contentServices.deleteClinic({ userId, doctorId, clinicId }, t)
          }
          await commonServices.delete(ClinicDoctorRelations, { where: { doctor_id: doctorId } }, { transaction: t })
          await t.commit()
          return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Doctor profile") })
        } else {
          res.status(200).json({ success: "false", message: message.NOT_DELETED("Doctor profile") });
        }
      } catch (error) {

        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
  } catch (error) {

    res.status(200).json({ success: 'false', message: error.message });
  }
};

// view doctors by id
exports.viewDoctorById = async (req, res) => {
  try {

    const Slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: Slug } });
    if (!user) {
      return res.status(200).json({ success: "false1", message: message.NO_DATA("Doctor profile") });
    }
    const userId = user.id;

    const role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
    if (!role) {
      return res.status(200).json({ success: "false2", message: message.NO_DATA("Doctor profile") });
    }
    const subRoleId = role.id;

    const isUserRole = await commonServices.verifyUserSubRole(userId, subRoleId)
    if (!isUserRole) {
      return res.status(200).json({ success: "false3", message: message.NO_DATA("Doctor profile") });
    }

    let query = {
      where: { slug: Slug },
      attributes: ["id", "full_name", "email", "countryCode", "phone_no", "profile_image"],
      include: [
        {
          model: UserDetails, as: "user_details", attributes: ["address1", "address2"],
          include: [
            {
              model: Areas, as: "areas", required: false, attributes: ["id", "pincode"],
              include: [
                { model: Cities, as: "cities", required: false, attributes: ["id", "city_name", "state_name", "country_name"] },
              ]
            },
          ]
        },
        {
          model: Doctors, as: "doctors", attributes: ["id", "status", "doctor_type", "experience", "createdAt", "document_type", "front_side_document", "back_side_document"],
          include: [
            {
              model: DoctorsEducations, as: "doctor_educations", required: false, attributes: ["id", "year"],
              include: [
                { model: Degrees, as: "degrees", required: false, attributes: ["id", "name"] },
                { model: Colleges, as: "colleges", required: false, attributes: ["id", "name"] },
              ]
            },
            {
              model: DoctorSpecialities, as: "doctor_specialities", required: false, attributes: ["id", "doctor_id"],
              include: [
                { model: Specialities, as: "specialities", required: false, attributes: ["id", "name", "image_path"] },
              ]
            },
            {
              model: ClinicDoctorRelations, as: "clinic_doctor_relations", required: false, attributes: ["id", "doctor_id"],
              include: [
                {
                  model: Clinics, as: "clinics", required: false, attributes: ['id', 'status', 'clinic_name', 'clinic_type', 'clinic_phone_number', 'address', 'consultation_fees', 'document_type', 'document_path', 'equipments'],
                  include: [
                    {
                      model: Areas, as: "areas", required: false, required: false, attributes: ["id", "name", "pincode"],
                      include: [
                        { model: Cities, as: "cities", required: false, required: false, attributes: ["id", "city_name", "state_name", "country_name"] },
                      ]
                    },
                    { model: ClinicTimings, as: "clinic_timings", required: false, attributes: ["id", "session_start_time", "session_end_time"] },
                    {
                      model: ClinicSpecialities, as: "clinic_specialities", required: false, attributes: ["id"],
                      include: [
                        { model: Specialities, as: "specialities", required: false, attributes: ["id", "name"] },
                      ]
                    },
                    {
                      model: ClinicFacilities, as: "clinic_facilities", required: false, attributes: ["id",],
                      include: [
                        { model: Facilities, as: "facilities", required: false, attributes: ["id", "name"] },
                      ]
                    },
                    {
                      model: ClinicTreatments, as: "clinic_treatments", required: false, attributes: ["id",/*  "treatment_id" */],
                      include: [
                        { model: Treatments, as: "treatments", required: false, attributes: ["id", "name"] },
                      ]
                    },
                  ]
                },
              ]
            }
          ]
        },

      ]
    }
    const data = await commonServices.get(User, query);
    const responseData = JSON.parse(JSON.stringify(data))

    responseData.doctors.clinic_doctor_relations.map(item => {
      item.clinics.equipments = JSON.parse(item.clinics.equipments);
    })
    const modifyResponse = commonResponse.modifyResponse(responseData)

    if (data != null) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Doctor profile"), data: modifyResponse });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
    }
  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all doctor data
exports.viewAllDoctors = async (req, res) => {
  try {

    const adminId = req.user.id;
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { status: { [Op.like]: `%${s}%` } },
          // { "$users.full_name$": { [Op.like]: `%${s}%` } },
          // { "$doctors.users.full_name$": { [Op.like]: `%${s}%` } },
          // { '$users.email$': { [Op.like]: `%${s}%` } },
          // { '$users.slug$': { [Op.like]: `%${s}%` } },
          // { '$users.phone_no$': { [Op.like]: `%${s}%` } },

          // { '$doctor_specialities.specialities.name$': { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    const query = {
      where: [DataObj],
      attributes: ["doctor_type", "status"],
      include: [
        { model: User, as: "users", attributes: ["id", "slug", "full_name", "phone_no", "profile_image", "createdAt"] },
        { model: DoctorRegistrationDetails, as: "doctor_registration_details", attributes: ["id", "registration_number"] },
        {
          model: DoctorsEducations, as: "doctor_educations", attributes: ["id", "degree_id"],
          include: [
            { model: Degrees, as: "degrees", attributes: ["name"] }
          ]
        },
        {
          model: DoctorSpecialities, as: "doctor_specialities", attributes: ["id", "speciality_id"],
          include: [
            { model: Specialities, as: "specialities", attributes: ["name"] }
          ]
        },
      ], distinct: true
    }

    let data = await commonServices.getAndCountAll(Doctors, query, limit, offset)

    if (data.length != 0) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("Doctor data"), data: responseData });

    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }


  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// active/incative doctors status
exports.activeInactiveDoctorStatus = async (req, res) => {
  try {
    const roleId = 3;;
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changeUserStatus(slug, roleId, status);

      // for push notification -----------
      const fullName = user.full_name;
      const email = user.email;
      const doctorUserId = user.id;
      const context = await emailTmplateServices.getProfileApproveContext({ full_name: fullName, status: 'inactive' })
      const payload = fcmNotificationPayload.activeAndDisactiveDoctorProfile({ userId: doctorUserId, body: "inactive" })
      await sendAllNotification.sendAllNotification({ payload, email: email, context })

      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Doctor") });
    } else {
      const status = true
      await contentServices.changeUserStatus(slug, roleId, status);

      // for push notification -----------
      const fullName = user.full_name;
      const email = user.email;
      const doctorUserId = user.id;
      const context = await emailTmplateServices.getProfileApproveContext({ full_name: fullName, status: 'active' })
      const payload = fcmNotificationPayload.activeAndDisactiveDoctorProfile({ userId: doctorUserId, body: "active" })
      await sendAllNotification.sendAllNotification({ payload, email: email, context })

      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Doctor") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// approve/disapprove doctor profile
exports.approveDoctorProfile = async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
    }
    const status = req.body.status
    const updateData = await commonServices.update(Doctors, { where: { user_id: user.id } }, { status: status })

    // for push notification -----------
    const fullName = user.full_name;
    const email = user.email;
    const doctorUserId = user.id;
    const context = await emailTmplateServices.getProfileApproveContext({ full_name: fullName })
    const payload = fcmNotificationPayload.approveAndDisapproveDoctorProfile({ userId: doctorUserId, body: status, })
    await sendAllNotification.sendAllNotification({ payload, email: email, context })

    if (updateData[0] == 1) {
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Doctor") });
    } else {
      res.status(200).json({ success: "false", message: message.STATUS_FAILED("Doctor") });
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message });
  }
};

// create the excel file from
exports.exportDoctorDetailsInExcel = async (req, res) => {
  try {
    const user = req.user;
    const timeDate = Date.now();
    const filename = `Doctor-${timeDate}.xlsx`

    const query = {
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      include: [
        { model: User, as: "users", include: [{ model: UserDetails, as: "user_details" }] },
        { model: DoctorRegistrationDetails, as: "doctor_registration_details", attributes: ["registration_number"] },
        { model: DoctorSpecialities, as: "doctor_specialities", include: [{ model: Specialities, as: "specialities", attributes: ["name"] }] },
      ]
    }
    let doctorData = await commonServices.getAll(Doctors, query)
    const responseData = JSON.parse(JSON.stringify(doctorData));
    if (responseData.length != 0) {
      let objs = responseData
      objs = objs.map(i => {
        return {
          full_name: i.users.full_name,
          gender: i.users.user_details.gender != null ? i.users.user_details.gender : "",
          age: i.users.user_details.age != null ? i.users.user_details.age : "",
          countryCode: `${i.users.countryCode}`,
          phone_no: `${i.users.phone_no}`,
          registration_number: i.doctor_registration_details.registration_number,
          doctor_type: i.doctor_type,
          speciality: i.doctor_specialities.map(i => { return i.specialities.name }),
          createdAt: moment(i.createdAt).format(options.DateFormat.DATETIME),
          status: i.status,
        }
      })
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("doctorsdetails");
      worksheet.columns = [
        { header: "Full Name", key: "full_name", width: 20 },
        { header: "Gender", key: "gender", width: 20 },
        { header: "Age", key: "age", width: 20 },
        { header: "CountryCode", key: "countryCode", width: 20 },
        { header: "Phone No", key: "phone_no", width: 20 },
        { header: "Registration number", key: "registration_number", width: 30 },
        { header: "Type Of Doctor", key: "doctor_type", width: 30 },
        { header: "Specialization", key: "speciality", width: 30 },
        { header: "CreatedAt", key: "createdAt", width: 30 },
        { header: "Status", key: "status", width: 30 },
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
      res.status(200).json({ success: "false", message: message.NO_DATA("Doctor data") })
    }


  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

//Add data in databse from excel file
exports.importDoctorDetailFromExcel = async (req, res) => {
  try {
    let workbook = new excel.Workbook();
    const { file_path } = req.body
    const paramKey = file_path.split("/").splice(3).join("/")
    console.log(paramKey, "paramkey")
    let s3bucket = new AWS.S3({
      accessKeyId: commonConfig.access_key_id,
      secretAccessKey: commonConfig.secrate_access_key_id,
      region: commonConfig.region
    });
    var params1 = { Bucket: commonConfig.bucketName, Key: paramKey };
    const stream = s3bucket.getObject(params1).createReadStream();

    workbook.xlsx.read(stream).then((workbook) => {
      var worksheet = workbook.getWorksheet(workbook._worksheets[1].name);
      const dataArray = [];
      worksheet.eachRow({ includeEmpty: false }, function (rows, rowNumber) {
        if (rowNumber >= 2) {
          const Rows = rows.values;
          const result = Object.values(Rows);
          dataArray.push({ "full_name": result[0], "gender": result[1], "age": result[2], "phone_no": result[3], "registration_number": result[4], "doctor_type": result[5], "speciality": result[6], "createdAt": result[7], "status": result[8] })
          // "email": typeof result[8] == "object" ? result[8].text : result[8]
        }
      });
      console.log(dataArray, "dataArray")
      return;
      var password1 = Math.random().toString(36).slice(-4);
      var password2 = Math.floor((Math.random() * 10) + 1);
      var password3 = Math.random().toString(36).toUpperCase().slice(-3)
      var password = password1 + password2 + password3
      return db.sequelize.transaction().then(async (t) => {
        for (let i = 0; i < arr1.length; i++) {
          try {
            await User.findOne({ where: { username: arr1[i].CUIL } }).then(async existUser => {
              if (!existUser) {
                await User.create({
                  username: arr1[i].CUIL,
                  password: bcrypt.hashSync(password, 8),
                  role_id: 3
                }, { transaction: t }
                ).then(async (user) => {
                  await Master_User.create({
                    user_id: user.id,
                    surname: arr1[i].surname,
                    name: arr1[i].name,
                    DNI: arr1[i].DNI,
                    CUIL: arr1[i].CUIL,
                    date_of_birth: arr1[i].date_of_birth,
                    file: arr1[i].file,
                    telephone: arr1[i].telephone,
                    linkedIn: "https://www.linkedin.com/",
                    email: arr1[i].email,
                    status: 1
                  }, { transction: t })
                }).then(async () => {

                  //send mail for registration detail
                  const transporter = nodemailer.createTransport({
                    host: configUrl.nodemailer_host,
                    tls: {
                      // do not fail on invalid certs
                      rejectUnauthorized: false,
                    },
                    secure: false, // upgrade later with STARTTLS
                    auth: {
                      user: configUrl.nodemailer_auth_username,
                      pass: configUrl.nodemailer_auth_password
                    }
                  });

                  // point to the template folder
                  const handlebarOptions = {
                    viewEngine: {
                      partialsDir: path.resolve(configUrl.partialsDir),
                      defaultLayout: false,
                    },
                    viewPath: path.resolve(configUrl.partialsDir),
                  };

                  // use a template file with nodemailer
                  transporter.use('compile', hbs(handlebarOptions))

                  const mailOptions = {
                    from: configUrl.nodemailer_auth_username,
                    to: arr1[i].email,
                    subject: 'para registro de usuario',
                    template: 'registrationemail', // the name of the template file i.e email.handlebars,
                    context: {
                      CUIL: `${arr1[i].CUIL}`,
                      password: `${password}`
                    },
                  }

                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.log(error)
                    } else {
                      console.log(info)
                    }
                  })
                })
              } else {
                return;
              }
            })
          } catch (err) {
            await t.rollback();
            return res.status(200).send({ success: 'false', message: err.message });
          }
        }
        await t.commit();
        return res.status(200).json({
          success: "true",
          message: "El archivo se cargó con éxito"
        })
      });
    }).catch(err => { res.status(200).json({ success: "false", message: err.message }) })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};