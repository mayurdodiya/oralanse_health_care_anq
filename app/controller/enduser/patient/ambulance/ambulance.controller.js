const db = require("../../../../models");
const { sequelize } = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices } = require("../../../../services/common");
const moment = require("moment");
const message = require("../../message");
const options = require("../../../../config/options");
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");
const emailTmplateServices = require("../../../../services/email_template")
const Op = db.Sequelize.Op;

const User = db.users;
const Clinic = db.clinics;
const Ambulance = db.ambulances;
const AmbulanceRequest = db.ambulance_requests;

//get all ambulance request
exports.getAllAmbulanceRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size, s, status } = req.query;
    var statusCondition = status ? { status: status } : ""
    const { limit, offset } = commonServices.getPagination(page, size);
    const ambulanceRequest = await commonServices.getAndCountAll(AmbulanceRequest,
      {
        where: { user_id: userId, ...statusCondition },
        attributes: { exclude: ["createdBy", "updatedBy", "updatedAt"] },
        include: [{ model: Ambulance, as: "ambulances", attributes: ["id", "clinic_id", "name", "vehicle_no", "type", "description"] }]
      }, limit, offset)

    const responseData = commonServices.getPagingData(ambulanceRequest, page, limit);
    const response = JSON.parse(JSON.stringify(responseData))
    return res.status(200).json({ success: "true", message: message.REQUEST_SUCCESS("Ambulance"), data: response });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//send ambulance request
exports.sendAmbulanceRequest = async (req, res) => {
  try {
    const userId = req.user.id
    const { userLatitude, userLongitude } = req.query
    const radius = 25
    const haversine = commonServices.haversineDistance(userLatitude, userLongitude)
    // let attributes = ["id"]
    let attributes = ["id", "user_id"]
    if (userLatitude && userLongitude) {
      attributes.push([sequelize.literal(haversine), 'distance'])
    }
    const clinicData = await commonServices.getAll(Clinic,
      {
        where: {
          has_ambulance: true,
          status: options.ClinicStatus.APPROVE,
          [Op.and]: userLatitude && userLongitude ? [
            sequelize.where(sequelize.literal(haversine), '<=', radius),
          ] : []
        },
        attributes: attributes,
        order: userLatitude && userLongitude ? sequelize.col('distance') : []
      })
    const clinicArr = clinicData.map(item => item.id)
    const ambulanceData = await commonServices.getAll(Ambulance, { where: { clinic_id: clinicArr } })
    const requestArr = ambulanceData.map(item => {
      return {
        ambulance_id: item.id,
        user_id: userId,
        status: options.AmbulanceRequestStatus.PENDING,
        createdBy: userId,
        ...req.body
      }
    })
    const ambulanceRequest = await commonServices.bulkCreate(AmbulanceRequest, requestArr)


    const userIdArr = clinicData.map(item => item.user_id)
    for (let z = 0; z < userIdArr.length; z++) {

      const userData = await commonServices.get(User, { where: { id: userIdArr[z] } })
      const fullName = userData.full_name;
      const email = userData.email;
      const context = await emailTmplateServices.getClinicAmbulanceRequestContext({ /* add changes valus as template require */ });
      const payload = fcmNotificationPayload.getAmbulanceRequest({ userId: userIdArr[z] });
      await sendAllNotification.sendAllNotification({ payload, email: email, context });

    }

    return res.status(200).json({ success: "true", message: message.REQUEST_SUCCESS("Ambulance"), data: ambulanceRequest })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}
