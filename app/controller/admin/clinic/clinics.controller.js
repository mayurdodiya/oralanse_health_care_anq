const db = require("../../../models");
const adminServices = require("../service");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content")
const emailTmplateServices = require("../../../services/email_template")
const message = require("../../admin/message");
const options = require("../../../config/options");
const sendAllNotification = require("../../../services/settings");
const excel = require("exceljs");
const moment = require("moment");
const fcmNotificationPayload = require("../../../services/fcm_notification_payload");



const Op = db.Sequelize.Op;

const User = db.users;
const UserSubRoles = db.user_subroles;
const Clinics = db.clinics;
const ClinicSpecialities = db.clinic_specialities;
const ClinicTreatment = db.clinic_treatments;
const ClinicTimings = db.clinic_timings;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const ClinicFacilities = db.clinic_facilities;
const HospitalAdmin = db.hospital_admins;
const Doctors = db.doctors;
const EnduserAssignRoles = db.enduser_assign_roles;
const Areas = db.areas;
const Cities = db.cities;
const Specialities = db.specialities;
const Facilities = db.facilities;
const Treatments = db.treatments;
const Patients = db.patients;


// add clinics
exports.addClinic = async (req, res) => {
  try {
    var adminId = req.user.id;

    let isEmailUnique = await adminServices.emailExist(req.body.email);
    if (!isEmailUnique) {
      return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Owner") })
    }

    let isPhoneUnique = await adminServices.phoneExist(req.body.phone_no);
    if (!isPhoneUnique) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Owner") })
    }

    let isDoctorEmailUnique = await adminServices.emailExist(req.body.doctor_email);
    if (!isDoctorEmailUnique) {
      return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Doctor") })
    }

    let isDoctorPhoneUnique = await adminServices.phoneExist(req.body.doctor_phone_no);
    if (!isDoctorPhoneUnique) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Doctor") })
    }

    if (req.body.pincode != null) {
      let isPincodeExist = await pincodeExist(req.body.pincode);
      if (isPincodeExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Owner pincode") })
      }
    }

    let clinicData = await adminServices.clinicPhoneExist(req.body.clinic_phone_number);
    if (!clinicData) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Clinic") })
    }

    if (req.body.clinic_pincode != null) {
      let isClinicPincodeExist = await pincodeExist(req.body.clinic_pincode);
      if (isClinicPincodeExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic pincode") })
      }
    }

    const t = await db.sequelize.transaction()
    try {

      const slug = await commonServices.generateSlug(req.body.full_name);
      let userData = await contentServices.createUserProfile({ slug, adminId, ...req.body }, t);
      let userId = userData.user.id;
      await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t)
      const clinicData = await contentServices.addClinic({ adminId, userId, ...req.body, pincode: req.body.clinic_pincode, location: req.body.clinic_location, latitude: req.body.clinic_latitude, longitude: req.body.clinic_longitude, consultation_fees: req.body.clinic_consultation_fees, document_type: req.body.clinic_document_type, home_visit: req.body.clinic_home_visit }, t)
      const clinicId = clinicData.addClinics.id;
      await contentServices.addHospitalAdmin({ adminId, userId, proof_type: req.body.document_type, ...req.body }, t)
      let role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
      let doctorRoleId = role.id;

      if (req.body.is_doctor_data == true) {

        const userSlug = await commonServices.generateSlug(req.body.doctor_full_name);
        let user = await contentServices.createUserProfile({ slug: userSlug, adminId, full_name: req.body.doctor_full_name, email: req.body.doctor_email, profile_image: req.body.doctor_profile_image, countryCode: req.body.doctor_countryCode, phone_no: req.body.doctor_phone_no, google_id: req.body.doctor_google_id, address1: req.body.doctor_address1, address2: req.body.doctor_address2, language_id: req.body.doctor_language_id, location: req.body.doctor_location, latitude: req.body.doctor_latitude, longitude: req.body.doctor_longitude, pincode: req.body.doctor_pincode, age: req.body.doctor_age, gender: req.body.doctor_gender, /* ...req.body */ }, t);
        var userDataId = user.user.id;
        let doctorData = await contentServices.addDoctor({ adminId, userId: userDataId, doctorRoleId, ...req.body, document_path: req.body.registration_document_path }, t)
        let doctorId = doctorData.doctor.id;
        await contentServices.addClinicDoctorRelation({ adminId, clinicId, doctorId, }, t);

        const context = await emailTmplateServices.getEmailContext({ full_name: req.body.doctor_full_name, email: req.body.doctor_email })
        await sendAllNotification.sendAllNotification({ email: req.body.doctor_email, context })

      }
      await t.commit()
      await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
      if (req.body.is_doctor_data == true) {
        await commonServices.update(User, { where: { id: userDataId } }, { createdBy: adminId })
      }
      const context = await emailTmplateServices.getEmailContext({ full_name: req.body.doctor_full_name, email: req.body.doctor_email })
      await sendAllNotification.sendAllNotification({ email: req.body.doctor_email, context })
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Clinic") })

    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// update clinics by id
exports.updateClinicsById = async (req, res) => {
  try {
    const adminId = req.user.id;
    const clinicId = req.body.clinic_id;
    const slug = req.params.slug;
    const email = req.body.email;

    let user = await commonServices.get(User, { where: { slug: slug } });
    if (user == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Owner") })
    }
    const userId = user.id;
    let patientData = await commonServices.get(Patients, { where: { user_id: userId } })
    let uniqueId = patientData.unique_id;

    let userData = await commonServices.get(Clinics, { where: { id: clinicId } });
    if (userData == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This clinic") })
    }

    let isEmailUnique = await adminServices.uniqueEmailUpdate(userId, email);
    if (isEmailUnique == false) {
      return res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Owner") })
    }

    let isPhoneUnique = await adminServices.uniquePhoneUpdate(req.body.phone_no, userId);
    if (isPhoneUnique == false) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Owner") })
    }

    if (req.body.pincode) {
      let isPincodeExist = await adminServices.isPincodeExist(req.body.pincode);
      if (isPincodeExist == false) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Owner pincode") })
      }
    }

    let clinicData = await adminServices.uniqueClinicPhoneUpdate(req.body.clinic_phone_number, clinicId);
    if (clinicData == false) {
      return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Clinic") })
    }

    if (req.body.clinic_pincode) {
      let isClinicPincodeExist = await adminServices.isPincodeExist(req.body.clinic_pincode);
      if (isClinicPincodeExist == false) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic pincode") })
      }
    }

    const t = await db.sequelize.transaction()
    try {

      await contentServices.updateUserProfile({ userId, adminId, roleId: 3, ...req.body }, t);
      await contentServices.updatePatientProfile({ userId, unique_id: uniqueId, ...req.body }, t)
      await contentServices.updateClinic({ adminId, userId, clinicId, ...req.body, pincode: req.body.clinic_pincode, location: req.body.clinic_location, latitude: req.body.clinic_latitude, longitude: req.body.clinic_longitude, consultation_fees: req.body.clinic_consultation_fees, document_type: req.body.clinic_document_type, home_visit: req.body.clinic_home_visit }, t)
      await contentServices.updateHospitalAdmin({ adminId, userId, proof_type: req.body.document_type, ...req.body }, t)

      await t.commit()
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Clinic") })

    } catch (error) {

      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// delete clinics by id
exports.deleteClinicsById = async (req, res) => {

  try {
    const clinicId = req.params.clinic_id;
    let clinicData = await commonServices.get(Clinics, { where: { id: clinicId } });
    if (clinicData) {
      const t = await db.sequelize.transaction()
      try {
        const userId = clinicData.user_id;;
        await contentServices.deleteClinic({ userId, clinicId }, t);

        let getAllDoctor = await commonServices.getAll(ClinicDoctorRelations, { where: { clinic_id: clinicId } });
        if (getAllDoctor != null) {
          let doctorArr = [];
          for (let j = 0; j < getAllDoctor.length; j++) {
            doctorArr.push(getAllDoctor[j].doctor_id)
          }
          let counter = 0;

          if (doctorArr.length != null) {
            for (let j = 0; j < doctorArr.length; j++) {
              counter++
              let otherClinic = await commonServices.getAll(ClinicDoctorRelations, { where: [{ doctor_id: doctorArr[j] }, { clinic_id: { [Op.ne]: clinicId } }] })
              if (otherClinic.length == 0) {
                let user = await commonServices.get(Doctors, { where: { id: doctorArr[j] } });
                if (user != null) {
                  const userId = user.user_id
                  let userRole = await commonServices.get(EnduserAssignRoles, { where: { user_id: userId } });
                  if (userRole != null) {
                    const userRoleId = userRole.id
                    await commonServices.delete(ClinicDoctorRelations, { where: { doctor_id: doctorArr[j] } })
                    // await contentServices.deleteDoctorProfile({ userId, userRoleId, doctorId: doctorArr[j] }, t)
                    // await commonServices.delete(EnduserAssignRoles, { where: { user_id: userId } })
                    // const user = await commonServices.delete(Doctors, { where: { id: { [Op.ne]: doctorArr } } })

                  }

                }
              }

            }

            await t.commit()
            return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Clinic data") })
          } else {
            await t.commit()
            return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Clinic data") })
          }
        } else {
          await t.commit()
          return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Clinic data") })
        }

      } catch (error) {

        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic data") })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// view clinics by id
exports.viewClinicsById = async (req, res) => {

  try {

    const clinicId = req.params.clinic_id;

    const query = {
      where: { id: clinicId },
      attributes: ['id', 'status', 'clinic_name', 'clinic_image', 'clinic_phone_number', 'address', 'consultation_fees', 'document_type', 'document_path', 'equipments', 'has_NABH', 'NABH_certificate_path', 'has_iso', 'iso_certificate_path', 'has_lab'],
      include: [
        { model: User, as: "users", attributes: ["id", "full_name", "email", "countryCode", "phone_no", "profile_image"] },
        {
          model: Areas, as: "areas", required: false, attributes: ["name", "pincode"],
          include: [
            { model: Cities, as: "cities", required: false, attributes: ["city_name", "state_name", "country_name"] },
          ]
        },
        { model: ClinicTimings, as: "clinic_timings", required: false, attributes: ["id", "session_start_time", "session_end_time"] },
        {
          model: ClinicSpecialities, as: "clinic_specialities", required: false, attributes: ["speciality_id"],
          include: [
            { model: Specialities, as: "specialities", required: false, attributes: ["id", "name"] },
          ]
        },
        {
          model: ClinicFacilities, as: "clinic_facilities", required: false, attributes: ["id", "facility_id"],
          include: [
            { model: Facilities, as: "facilities", required: false, attributes: ["id", "name"] },
          ]
        },
        {
          model: ClinicTreatment, as: "clinic_treatments", required: false, attributes: ["id", "treatment_id", "treatment_fees", "description", "brand_name", "parent_treatment_id"],
          include: [
            { model: Treatments, as: "treatments", required: false, attributes: ["id", "name"] },
          ]
        },
      ]
    }

    let data = await commonServices.get(Clinics, query);
    data.equipments = JSON.parse(data.equipments)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Clinic data"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Clinic data") });
    }
  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all clinics
exports.viewAllClinics = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let getallDataObj = {};
    if (s) {
      getallDataObj = {
        ...getallDataObj,
        [Op.or]: [
          { clinic_name: { [Op.like]: `%${s}%` } },
          { clinic_phone_number: { [Op.like]: `%${s}%` } },
          { status: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    const query = {
      where: [getallDataObj],
      attributes: ['id', 'status', 'clinic_name', 'clinic_image', 'clinic_phone_number', 'address', 'createdAt'],
      include: [
        { model: User, as: "users", attributes: ["id", "slug", "email"] }
      ]
    }

    let data = await commonServices.getAndCountAll(Clinics, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("Clinic data"), data: responseData });

    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Clinic data") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// active/incative clinics status
exports.updateClinicStatus = async (req, res) => {
  try {
    const slug = req.params.slug;

    const user = await commonServices.get(User, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
    }
    const userId = user.id;

    const userData = await commonServices.get(HospitalAdmin, { where: { user_id: userId } });
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") });
    }

    const userStatus = userData.is_verified;
    if (userStatus == true) {
      const status = false
      await contentServices.changeHospitalAdminStatus(userId, status);

      // for push notification -----------
      const fullName = user.full_name;
      const email = user.email;
      const doctorUserId = user.id;
      const context = await emailTmplateServices.getProfileApproveContext({ full_name: fullName, status: "inactive" })
      const payload = fcmNotificationPayload.activeAndDisactiveClinicProfile({ userId: 363, body: "inactive", })
      await sendAllNotification.sendAllNotification({ payload, email: email, context })

      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Clinic") });
    } else {
      const status = true
      await contentServices.changeHospitalAdminStatus(userId, status);

      // for push notification -----------
      const fullName = user.full_name;
      const email = user.email;
      const doctorUserId = user.id;
      const context = await emailTmplateServices.getProfileApproveContext({ full_name: fullName, status: "active" })
      const payload = fcmNotificationPayload.activeAndDisactiveClinicProfile({ userId: 363, body: "active", })
      await sendAllNotification.sendAllNotification({ payload, email: email, context })

      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Clinic") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// approve/disapprove doctor profile
exports.approveClinicProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await commonServices.get(Clinics, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Clinic") });
    }
    const clinicId = user.id;
    const status = req.body.status
    const updateData = await commonServices.update(Clinics, { where: { id: clinicId } }, { status: status })

    // for push notification -----------
    const clinicUserId = user.user_id;
    const userData = await commonServices.get(User, { where: { id: clinicUserId } })
    const fullName = userData.full_name;
    const email = userData.email;
    const context = await emailTmplateServices.getProfileApproveContext({ full_name: fullName })
    const payload = fcmNotificationPayload.approveAndDisapproveClinicProfile({ userId: clinicUserId, body: status, })
    await sendAllNotification.sendAllNotification({ payload, email: email, context })

    if (updateData[0] == 1) {
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Clinic") });
    } else {
      res.status(200).json({ success: "false", message: message.STATUS_FAILED("Clinic") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// create the excel file from database
exports.exportClinicDetailsInExcel = async (req, res) => {
  try {
    const user = req.user;
    const timeDate = Date.now();
    const filename = `Clinic-${timeDate}.xlsx`

    const query = {
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ['id', 'status', 'clinic_name', 'clinic_phone_number', 'address', "createdAt"],
      include: [{ model: User, as: "users" }]
    }

    let clinicData = await commonServices.getAll(Clinics, query)
    const responseData = JSON.parse(JSON.stringify(clinicData));
    if (responseData.length != 0) {
      let objs = responseData
      objs = objs.map(i => {
        return {
          clinic_name: i.clinic_name,
          clinic_phone_number: i.clinic_phone_number,
          email: i.users.email,
          address: i.address,
          createdAt: moment(i.createdAt).format(options.DateFormat.DATETIME),
          status: i.status
        }
      })
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("clinicdetails");
      worksheet.columns = [
        { header: "Clinic Name", key: "clinic_name", width: 20 },
        { header: "Clinic phone number", key: "clinic_phone_number", width: 20 },
        { header: "Email", key: "email", width: 20 },
        { header: "Address", key: "address", width: 20 },
        { header: "CreatedAt", key: "createdAt", width: 20 },
        { header: "Status", key: "status", width: 20 },
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
      res.status(200).json({ success: "false", message: message.NO_DATA("Clinic data") })
    }


  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};