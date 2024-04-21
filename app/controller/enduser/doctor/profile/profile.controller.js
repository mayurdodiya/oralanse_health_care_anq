const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const endUserServices = require("../../../enduser/services");
const emailServices = require("../../../../services/email");
const uploadService = require("../../../../services/uploadFile");
const commonResponse = require("./common.response");
const authServices = require("./service");
const commonConfig = require("../../../../config/common.config");
const message = require("../../message");
const config = require("../../../../config/config.json");
const options = require('../../../../config/options');
const Op = db.Sequelize.Op;

const User = db.users;
const UserDetails = db.user_details;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const HospitalAdmins = db.hospital_admins;
const Patient = db.patients;
const Otps = db.otps;
const DeviceToken = db.device_tokens;
const City = db.cities;
const UserSubrole = db.user_subroles;
const Area = db.areas;
const DoctorTiming = db.doctor_timings;
const Doctors = db.doctors;
const Clinics = db.clinics;
const EnduserAssignRoles = db.enduser_assign_roles;



//doctor registration
exports.doctorRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const roleId = req.user.role_id;
    const uniqueId = req.user.patients.unique_id;
    let subrole = await commonServices.get(UserSubrole, { where: { name: options.PortalType.DOCTOR } })
    let doctorRoleId = subrole.id;

    const isRegistered = await commonServices.get(Doctors, { where: { user_id: userId } })
    if (isRegistered) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Doctor") })
    }

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

          const isUserExist = await commonServices.get(EnduserAssignRoles, { where: [{ user_id: userId }, { user_subrole_id: doctorRoleId }] })
          if (isUserExist != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("User") })
          }

          const userdata = await contentServices.updateUserProfile({ userId, roleId, ...req.body }, t)
          const patient = await contentServices.updatePatientProfile({ userId, unique_id: uniqueId, ...req.body }, t)
          const doctorData = await contentServices.addDoctor({ userId, doctorRoleId, ...req.body }, t)
          await t.commit();
          return res.status(200).json({ success: "true", message: message.REGISTER_SUCCESS, data: { ...doctorData } })
        } catch (error) {
          console.log(error);
          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message })
        }
      } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
    } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//edit profile
exports.editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;
    const roleId = req.user.role_id;
    const uniqueId = req.user.patients.unique_id;

    // const emailExist = await endUserServices.uniqueEmailUpdate(req.body.email, userId)
    // if (emailExist) {
    //   const phoneExist = await endUserServices.uniquePhoneUpdate(req.body.phone_no, userId)
    //   if (phoneExist) {
    const t = await db.sequelize.transaction()
    try {
      if (req.body.pincode) {
        const pincodeData = await pincodeExist(req.body.pincode)
        if (pincodeData) {
          return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
        }
      }
      await contentServices.updateUserProfile({ userId, roleId, ...req.body }, t)
      await contentServices.updatePatientProfile({ userId, unique_id: uniqueId, ...req.body }, t)
      await contentServices.updateDoctorProfile({ userId, doctorId, ...req.body }, t);
      await t.commit()
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Doctor data") })
    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
    // } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
    // } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view profile
exports.viewProfile = async (req, res) => {
  try {

    const userId = req.user.id;
    let data = await contentServices.viewDoctorProfile({ userId })
    const responseData = JSON.parse(JSON.stringify(data))

    const isOwnerExist = await commonServices.get(HospitalAdmins, { where: { user_id: userId } })
    if (isOwnerExist != null) {
      var isOwner = { is_owner: true }
    } else {
      var isOwner = { is_owner: false }
    }

    if (data != null) {

      const response = Object.assign({}, {
        ...responseData,
        ...isOwner
      })

      res.status(200).json({ success: "true", message: message.GET_DATA("Doctor"), data: response })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// logout
exports.doctorLogout = async (req, res) => {
  try {
    const userId = req.user.id;
    const subrole = await commonServices.get(UserSubrole, { name: options.PortalType.DOCTOR })
    const doctorRoleId = subrole.id;
    const user = await commonServices.get(User, { where: [{ id: userId }, { role_id: doctorRoleId }, { is_active: 1 }] });
    if (user) {
      return res.status(200).json({ success: "false", message: message.LOGOUT_SUCCESS() })
    } else {
      return res.status(200).json({ success: "false", message: message.LOGOUT_FAILED() })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// add clinic
exports.addClinic = async (req, res) => {
  try {
    const type = req.query.type;  // clinic type owner or cunsultant doctor
    const user = req.user;
    const userId = user.id;
    const doctorId = user.doctors.id;
    const doctorProfile = user.doctors;

    const isUser = await commonServices.get(UserDetails, { where: [{ user_id: userId }, { active_profile: options.PortalType.DOCTOR }] })
    if (!isUser) {
      return res.status(200).json({ success: "false", message: message.NO_SUBROLE_PROFILE("doctor") })
    }

    if (type == "owner") {
      // add clinic

      const isOwner = await commonServices.get(Clinics, { where: { user_id: userId } })
      if(isOwner)
      {
        return res.status(200).json({ success: "false", message: message.CLINIC_OWNER_EXIST })
      }
      
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
        const clinicData = await contentServices.addClinic({ userId, ...req.body, pincode: req.body.clinic_pincode, location: req.body.clinic_location, latitude: req.body.clinic_latitude, longitude: req.body.clinic_longitude, consultation_fees: req.body.clinic_consultation_fees, document_type: req.body.clinic_document_type, home_visit: req.body.clinic_home_visit }, t)
        const clinicId = clinicData.addClinics.id;
        await contentServices.addHospitalAdmin({ is_verified: 0, userId, proof_type: doctorProfile.document_type, identity_proof_doc_path: doctorProfile.front_side_document }, t)
        await contentServices.addClinicDoctorRelation({ userId, clinicId, doctorId, }, t);
        await t.commit();
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Clinic") });
      } catch (error) {
        await t.rollback()
        res.status(200).json({ success: "false", message: error.message });
      }
    } else {
      // clinic nu listing only
      const data = await commonServices.getAll(Clinics, { where: [{ status: options.ClinicStatus.APPROVE }] });
      if (data != 0) {
        return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic"), data: data })
      } else {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
      }
    }
  } catch (error) {

    return res.status(200).json({ success: "false", message: error.message });
  }
};

// edit clinic profile by id
exports.editClinicProfileById = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.params.id;

    const isOwnerExist = await commonServices.get(Clinics, { where: [{ id: clinicId }, { user_id: userId }] })
    if (!isOwnerExist) {
      return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER })
    }

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

// view clinic profile
exports.viewClinicProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const isOwnerExist = await commonServices.get(HospitalAdmins, { where: [{ user_id: userId }] })
    if (!isOwnerExist) {
      return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER })
    }
    const isExist = await commonServices.get(Clinics, { where: [{ user_id: userId }] })
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
    }

    const data = await contentServices.viewHospitalProfile({ userId })
    const response = data.clinics;
    response.equipments = JSON.parse(response.equipments);

    if (data != null) {
      return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic"), data: response })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// all clinic listing
exports.clinicListing = async (req, res) => {
  try {
    const { page, size, s } = req.query;
    let DataObj = {}
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { clinic_name: { [Op.like]: `%${s}%` } },
          { clinic_type: { [Op.like]: `%${s}%` } },
          { clinic_phone_number: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const query = {
      where: [DataObj],
      attributes: ["id", "clinic_name", "clinic_type", "clinic_phone_number", "address", "clinic_image", "rating_point"]
    };

    const { limit, offset } = commonServices.getPagination(page, size);
    const data = await commonServices.getAndCountAll(Clinics, query, limit, offset)
    const response = commonServices.getPagingData(data, page, limit);
    let responseData = JSON.parse(JSON.stringify(response))

    return res.status(200).json({ success: "false", message: message.GET_DATA("Clinic"), data: responseData })

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};

// select clinic
exports.selectClinic = async (req, res) => {
  try {
    const doctorId = req.user.doctors.id;
    const data = await commonServices.get(ClinicDoctorRelations, { where: { doctor_id: doctorId } })
    if (data) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Clinic") })
    }
    // for add multiple clinic
    // const objData = clinics.map(item => {
    //   return {
    //     clinic_id: item,
    //     doctor_id: doctorId
    //   }
    // })

    const objData = {
      clinic_id: req.body.clinic_id,
      doctor_id: doctorId
    }

    // const addRelation = await commonServices.bulkCreate(ClinicDoctorRelations, objData)
    const addRelation = await commonServices.create(ClinicDoctorRelations, objData)
    if (addRelation) {
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Clinic") })
    } else {
      return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Clinic") })
    }

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};

// edit selected clinic
exports.editSelectedClinic = async (req, res) => {
  try {
    const doctorId = req.user.doctors.id;
    const data = await commonServices.get(ClinicDoctorRelations, { where: { doctor_id: doctorId } })
    if (!data) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") })
    }
    const relationId = data.id
    console.log(relationId);

    const objData = {
      clinic_id: req.body.clinic_id
    }

    const addRelation = await commonServices.update(ClinicDoctorRelations, { where: [{ id: relationId }] }, objData)
    if (addRelation) {
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Clinic") })
    } else {
      return res.status(200).json({ success: "false", message: message.CHANGE_DATA_FAILED("Clinic") })
    }

  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};