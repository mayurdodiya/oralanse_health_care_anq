const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const endUserServices = require("../../../enduser/services");
const emailTmplateServices = require("../../../../services/email_template");
const sendAllNotification = require("../../../../services/settings");
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const emailTemplate = require("../../../../services/email_template");
const { query } = require("express");


const User = db.users;
const UserSubrole = db.user_subroles;
const Doctors = db.doctors;
const Clinics = db.clinics;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const Patients = db.patients;
const EnduserAssignRoles = db.enduser_assign_roles;
const DoctorsEducations = db.doctor_educations;
const Degrees = db.degrees;


// view owner profile
exports.viewOwnerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await contentServices.viewUserProfile({ userId })
    const hospitalAdmin = await contentServices.getHospitalAdminDetail({ userId });
    const modifyOwnerRes = commonResponse.modifyOwnerRes({ data, hospitalAdmin })

    if (data != null) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic owner"), data: modifyOwnerRes })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic owner") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view clinic profile
exports.viewClinicProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await contentServices.viewHospitalProfile({ userId })
    const response = data.clinics;
    // console.log(response.equipments);
    if (response.equipments) {
      if (response.equipments.length != 0) {
        response.equipments = JSON.parse(response.equipments);
      }
    }

    if (data != null) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic owner"), data: response })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic owner") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view all doctor profile list
exports.viewAllDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;

    const data = await contentServices.getClinicAllDoctor({ clinicId })
    if (data != null) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic doctor"), data: data })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic doctor") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};


// doctor dropdown list
exports.doctorDropdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;

    const data = await contentServices.clinicAllDoctorDropdown({ clinicId })
    if (data != null) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic doctor"), data: data })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic doctor") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view doctor profile by id
exports.viewDoctorProfileById = async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } })
    if(!user)
    {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }

    const userId = user.id;
    let data = await contentServices.viewDoctorProfile({ userId })
    const modifyClinicDoctorRes = commonResponse.modifyClinicDoctorRes(data)

    if (data != null) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Doctor"), data: modifyClinicDoctorRes })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// create owner profile
exports.createOwnerProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.user.id;
    const roleId = req.user.role_id;
    const uniqueId = req.user.patients.unique_id;
    let subrole = await commonServices.get(UserSubrole, { where: { name: options.PortalType.HOSPITAL } })
    let ownerRoleId = subrole.id;

    const emailExist = await endUserServices.uniqueEmailUpdate(req.body.email, userId)
    if (emailExist) {
      const phoneExist = await endUserServices.uniquePhoneUpdate(req.body.phone_no, userId)
      if (phoneExist) {
        const t = await db.sequelize.transaction()
        try {
          if (req.body.pincode) {
            const pincodeData = await pincodeExist(req.body.pincode)
            if (pincodeData) {
              return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
            }
          }

          const isUserExist = await commonServices.get(EnduserAssignRoles, { where: [{ user_id: userId }, { user_subrole_id: ownerRoleId }] })
          if (isUserExist != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("User") })
          }

          await contentServices.updateUserProfile({ userId, roleId, ...req.body }, t)
          await contentServices.updatePatientProfile({ userId, unique_id: uniqueId, ...req.body }, t)
          await contentServices.asignUserRole({ userId, roleId: ownerRoleId }, t)
          await contentServices.addHospitalAdmin({ userId, is_verified: 0, ...req.body }, t)
          await t.commit();
          return res.status(200).json({
            success: "true",
            message: message.REGISTER_SUCCESS,
            data: {
              id: user.id,
              full_name: req.body.full_name,
              email: req.body.email,
              slug: user.slug,
              countryCode: req.body.countryCode,
              phone_no: req.body.phone_no,
              profile_image: req.body.profile_image,
              gender: req.body.gender,
            }
          })
        } catch (error) {

          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message })
        }
      } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
    } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }
};

// create clinic profile
exports.addClinic = async (req, res) => {
  try {
    const userId = req.user.id;

    let clinicData = await endUserServices.clinicPhoneExist(req.body.clinic_phone_number);
    if (!clinicData) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Clinic") })
    }

    if (req.body.clinic_pincode != null) {
      let isClinicPincodeExist = await pincodeExist(req.body.clinic_pincode);
      if (isClinicPincodeExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic pincode") })
      }
    }

    const t = await db.sequelize.transaction();
    try {
      await contentServices.addClinic({ userId, ...req.body }, t)
      await t.commit();
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Clinic") });
    } catch (error) {
      await t.rollback()
      res.status(200).json({ success: "false", message: error.message });
    }

  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: "false", message: error.message });
  }
};

// add clinic multiple doctor
exports.addClinicDoctor = async (req, res) => {
  try {
    const ownerUserId = req.user.id;
    const clinicId = req.user.clinics.id;
    const phoneExist = await commonServices.get(User, { where: { phone_no: req.body.phone_no } })
    if (phoneExist) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("User") })
    }

    const emailExist = await commonServices.get(User, { where: { email: req.body.email } })
    if (emailExist) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("User email") })
    }

    let role = await commonServices.get(UserSubrole, { where: { name: options.PortalType.DOCTOR } })
    if (!role) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor role") });
    }
    let doctorRoleId = role.id;

    if (req.body.pincode != null) {
      let isPincodeExist = await pincodeExist(req.body.pincode);
      if (isPincodeExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
      }
    }

    const t = await db.sequelize.transaction();
    try {
      const slug = await commonServices.generateSlug(req.body.full_name)

      let userData = await contentServices.createUserProfile({ adminId: ownerUserId, slug, ...req.body }, t)
      let userId = userData.user.id;
      await contentServices.createPatientProfile({ adminId: ownerUserId, userId, ...req.body }, t)
      let doctorData = await contentServices.addDoctor({ userId, doctorRoleId, ...req.body }, t)
      let doctorId = doctorData.doctor.id;
      await contentServices.addClinicDoctorRelation({ userId, clinicId, doctorId, }, t)
      await t.commit();
      const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
      await sendAllNotification.sendAllNotification({ email: req.body.email, context })
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Doctor") });
    } catch (error) {
      await t.rollback()
      res.status(200).json({ success: "false", message: error.message });
    }

  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: "false", message: error.message });
  }
};

// edit owner profile
exports.editOwnerProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.user.id;
    const roleId = req.user.role_id;
    const uniqueId = req.user.patients.unique_id;

    // const emailExist = await endUserServices.uniqueEmailUpdate(req.body.email, userId)
    // if (emailExist) {
    // const phoneExist = await endUserServices.uniquePhoneUpdate(req.body.phone_no, userId)

    if (req.body.pincode) {
      const pincodeData = await pincodeExist(req.body.pincode)
      if (pincodeData) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
      }
    }
    // if (phoneExist) {
    const t = await db.sequelize.transaction()
    try {
      await contentServices.updateUserProfile({ userId, roleId, ...req.body }, t)
      await contentServices.updatePatientProfile({ userId, unique_id: uniqueId, ...req.body }, t)
      await contentServices.updateHospitalAdmin({ userId, is_verified: 0, ...req.body }, t)

      await t.commit();
      return res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Your profile")
      })
    } catch (error) {

      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
    // } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
    // } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }
};

// edit clinic profile by id
exports.editClinicProfileById = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;

    if (req.body.pincode) {
      const pincodeData = await pincodeExist(req.body.pincode)
      if (pincodeData) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
      }
    }

    // if (req.body.clinic_phone_number) {
    //   let clinicData = await endUserServices.uniqueClinicPhoneUpdate(req.body.clinic_phone_number, clinicId);
    //   if (clinicData == false) {
    //     return res.status(200).json({ success: "false", message: message.DATA_EXIST("Clinic phone no") })
    //   }
    // }

    const t = await db.sequelize.transaction()
    try {
      await contentServices.updateClinic({ userId, clinicId, ...req.body }, t)

      await t.commit()
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Clinic data") })
    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// edit doctor profile by id
exports.editDoctorProfileById = async (req, res) => {
  try {
    const userId = req.user.id;
    const slug = req.params.slug;
    const userData = await commonServices.get(User, { where: { slug: slug } });
    const patientUserId = userData.id
    const roleId = userData.role_id
    const patientData = await commonServices.get(Patients, { where: { user_id: patientUserId } });
    const uniqueId = patientData.unique_id;
    const doctorData = await commonServices.get(Doctors, { where: { user_id: patientUserId } });
    const doctorId = doctorData.id

    if (req.body.pincode) {
      const pincodeData = await pincodeExist(req.body.pincode)
      if (pincodeData) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
      }
    }

    const t = await db.sequelize.transaction()
    try {
      await contentServices.updateUserProfile({ userId: patientUserId, roleId, ...req.body }, t)
      await contentServices.updatePatientProfile({ userId: patientUserId, unique_id: uniqueId, ...req.body }, t)
      await contentServices.updateDoctorProfile({ userId: patientUserId, doctorId, ...req.body }, t);

      await t.commit()
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Doctor data") })
    } catch (error) {

      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};