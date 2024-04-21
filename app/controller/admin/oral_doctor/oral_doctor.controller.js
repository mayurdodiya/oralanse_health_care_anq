const db = require("../../../models");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const commonResponse = require("./common.response");
const message = require("../message");
const adminServices = require("../service");
const { methods: contentServices } = require("../../../services/content");
const excel = require("exceljs");
const Op = db.Sequelize.Op;
const moment = require("moment");
const options = require("../../../config/options");
const emailTmplateServices = require("../../../services/email_template");
const sendAllNotification = require("../../../services/settings");


const User = db.users;
const UserDetails = db.user_details;
const Roles = db.roles
const Areas = db.areas;
const Cities = db.cities;
const OralDoctors = db.oral_doctors;
const Degree = db.degrees;



// add oral doctors
exports.addOralDoctors = async (req, res) => {
  try {

    const adminId = req.user.id;

    let isPincodeExist = await pincodeExist(req.body.pincode);
    if (isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") });
    }

    let role = await commonServices.get(Roles, { where: { name: options.PortalType.ORALDOCTOR } })
    if (!role) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor role") });
    }
    let doctorRoleId = role.id;

    const isEmailExists = await commonServices.get(User, { where: { email: req.body.email } });
    if (isEmailExists) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") });
    }

    const isPhoneExists = await commonServices.get(User, { where: { phone_no: req.body.phone_no } });
    if (isPhoneExists) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone") });
    }

    const t = await db.sequelize.transaction()
    try {

      const slug = await commonServices.generateSlug(req.body.full_name);
      let userData = await contentServices.createUserProfile({ slug, roleId: doctorRoleId, adminId, ...req.body }, t);
      let userId = userData.user.id;
      await contentServices.addOralDoctor({ adminId, userId, doctorRoleId, ...req.body }, t)

      await t.commit()
      await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })

      const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
      await sendAllNotification.sendAllNotification({ email: req.body.email, context })
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Oral doctor") });

    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message });
    }

  } catch (error) { 
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// update oral doctors
exports.updateOralDoctorsById = async (req, res) => {
  try {
    const adminId = req.user.id;
    const slug = req.params.slug;

    const user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const userId = user.id;

    const userData = await commonServices.get(OralDoctors, { where: { user_id: userId } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }
    const doctorId = userData.id

    const role = await commonServices.get(Roles, { where: { name: options.PortalType.ORALDOCTOR } })
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

    const t = await db.sequelize.transaction()
    try {

      await contentServices.updateUserProfile({ adminId, userId, roleId: userRoleId, ...req.body }, t);
      await contentServices.updateOralDoctorProfile({ adminId, userId, doctorId, ...req.body }, t);

      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Doctor profile") })
    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// delete oral doctors
exports.deleteOralDoctorsById = async (req, res) => {
  try {
    const slug = req.params.slug;

    let user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User profile") });
    }

    const role = await commonServices.get(Roles, { where: { name: options.PortalType.ORALDOCTOR } })
    const userRoleId = role.id;
    const userId = user.id;


    const isUserRole = await commonServices.verifyUserSubRole(userId, userRoleId)
    if (!isUserRole) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
    } else {

      const doctor = await commonServices.get(OralDoctors, { where: { user_id: userId } })
      const doctorId = doctor.id;
      const t = await db.sequelize.transaction();
      try {
        const data = await contentServices.deleteUserProfile({ userId, roleId: userRoleId }, t)
        await contentServices.deleteOralDoctorProfile({ userId, doctorId, userRoleId }, t)
        await t.commit()
        return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Doctor profile") })
      } catch (error) {

        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    }
  } catch (error) {

    res.status(200).json({ success: 'false', message: error.message });
  }
};

// view oral doctors by id
exports.viewOralDoctorById = async (req, res) => {
  try {

    const Slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: Slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
    }
    const userId = user.id;

    const role = await commonServices.get(Roles, { where: { name: options.PortalType.ORALDOCTOR } })
    if (!role) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
    }
    const roleId = role.id;

    const isUserRole = await commonServices.verifyUserSubRole(userId, roleId)
    if (!isUserRole) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
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
        { model: OralDoctors, as: "oral_doctors", attributes: ["id", "status", "doctor_type", "experience", "createdAt", "document_type", "front_side_document", "back_side_document"], },

      ]
    }
    const data = await commonServices.get(User, query);
    const responseData = JSON.parse(JSON.stringify(data))

    if (data != null) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Doctor profile"), data: responseData });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
    }


  } catch (error) {

    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all oral doctor data
exports.viewAllOralDoctors = async (req, res) => {
  try {

    const adminId = req.user.id;
    const { page, size, s } = req.query;

    let response = await contentServices.viewAllOralDoctors({ adminId, page, size, s })

    if (response.length != 0) {

      let responseData = JSON.parse(JSON.stringify(response))
      return res.status(200).json({ success: "true", message: message.GET_DATA("Doctor data"), data: responseData });

    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// active/incative doctors status
exports.updateOralDoctorStatus = async (req, res) => {
  try {
    const role = await commonServices.get(Roles, { where: { name: options.PortalType.ORALDOCTOR } })
    const roleId = role.id;
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changeUserStatus(slug, roleId, status);0
      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Doctor") });
    } else {
      const status = true
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Doctor") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// create the excel file
exports.exportDoctorDetailsInExcel = async (req, res) => {
  try {
    // const user = req.user;
    const timeDate = Date.now();
    const filename = `OralDoctor-${timeDate}.xlsx`

    const query = {
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      include: [
        { model: User, as: "users_oral_doctor", include: [{ model: UserDetails, as: "user_details" }] },
        { model: Degree, as: "oral_doctor_degree" }
      ]
    }
    let doctorData = await commonServices.getAll(OralDoctors, query)
    const responseData = JSON.parse(JSON.stringify(doctorData));
    if (responseData.length != 0) {
      let objs = responseData
      objs = objs.map(i => {
        return {
          full_name: i.users_oral_doctor.full_name,
          gender: i.users_oral_doctor.user_details.gender != null ? i.users_oral_doctor.user_details.gender : "",
          age: i.users_oral_doctor.user_details.age != null ? i.users_oral_doctor.user_details.age : "",
          phone_no: `${i.users_oral_doctor.countryCode}${i.users_oral_doctor.phone_no}`,
          degree: i.oral_doctor_degree.name,
          email: `${i.users_oral_doctor.email}`,
          registration_number: i.registration_number,
          doctor_type: i.doctor_type,
          createdAt: moment(i.createdAt).format(options.DateFormat.DATETIME),
          status: i.status,
        }
      })
      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("OralDoctorsDetails");
      worksheet.columns = [
        { header: "Full Name", key: "full_name", width: 20 },
        { header: "Gender", key: "gender", width: 20 },
        { header: "Age", key: "age", width: 20 },
        { header: "Phone No", key: "phone_no", width: 20 },
        { header: "Email", key: "email", width: 20 },
        { header: "Registration number", key: "registration_number", width: 30 },
        { header: "Degree", key: "degree", width: 30 },
        { header: "Type Of Doctor", key: "doctor_type", width: 30 },
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
