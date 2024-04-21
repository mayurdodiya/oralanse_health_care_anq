const db = require("../../../models");
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const commonResponse = require("./common.response");
const Op = db.Sequelize.Op;




const Areas = db.areas;
const Cities = db.cities;
const User = db.users;
const Doctors = db.doctors;
const Clinics = db.clinics;
const Patients = db.patients;
const ClinicStaffs = db.clinic_staffs;



// add push notification
exports.addPushNotification = async (req, res) => {
  try {
    const adminId = req.user.id;
    const slug = await commonServices.generateSlug(req.body.title)
    const data = await contentServices.addPushNotification({ slug, adminId, ...req.body })

    if (data != null) {
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Push notification") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}


// view all push notification
exports.viewAllPushNotification = async (req, res) => {

  try {

    const { page, size, s } = req.query;
    const userData = await commonServices.getAndCountAll(User, { where: { is_active: true } })
    const userCount = userData.count
    const doctorData = await commonServices.getAndCountAll(Doctors, { where: { status: 'approve' } })
    const doctorCount = doctorData.count
    const clinicData = await commonServices.getAndCountAll(Clinics, { where: { status: 'approved' } })
    const clinicCount = clinicData.count
    const patientData = await commonServices.getAndCountAll(Patients, { where: { deletedAt: null } })
    const patientCount = patientData.count
    const staffData = await commonServices.getAndCountAll(ClinicStaffs, { where: { deletedAt: null } })
    const staffCount = staffData.count

    const data = await contentServices.viewAllPushNotification({ page, size, s })

    if (data) {
      let responseData = await JSON.parse(JSON.stringify(data))
      const modifyRes = commonResponse.modifyRes(responseData)

      modifyRes.map(i => {
        if (i.type == 'user') {
          i.numberOfUser = userCount
        }
        if (i.type == 'doctor') {
          i.numberOfUser = doctorCount
        }
        if (i.type == 'hospital') {
          i.numberOfUser = clinicCount
        }
        if (i.type == 'patient') {
          i.numberOfUser = patientCount
        }
        if (i.type == 'staff') {
          i.numberOfUser = staffCount
        }
      })

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Push notification"),
        data: {
          totalItems: responseData.totalItems,
          data: modifyRes,
          totalPages: responseData.totalPages,
          currentPage: responseData.currentPage,
        }

      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

