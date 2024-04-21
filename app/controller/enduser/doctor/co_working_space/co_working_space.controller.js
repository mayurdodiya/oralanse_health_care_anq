const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const emailTmplateServices = require("../../../../services/email_template");
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");
const moment = require("moment")

const CoWorkingSpaces = db.co_working_spaces;
const CoWorkingSpaceRequests = db.co_working_space_requests;
const Doctors = db.doctors;
const Clinic = db.clinics;


// view all co-working spaces
exports.viewAllCoWorkingSpaces = async (req, res) => {
  try {
    const { page, size, s } = req.query;

    const data = await contentServices.viewAllCoWorkingSpaces({ page, size, s })

    const response = JSON.parse(JSON.stringify(data))


    return res.status(200).json({ success: "true", message: message.GET_DATA("Co working"), data: response })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view co-working space detail by id
exports.viewCoWorkingSpaceDetailById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await contentServices.viewCoWorkingSpaceDetail({ id })
    data.amenities = JSON.parse(data.amenities);
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Co working"), data: data });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Co working") });
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// apply for co-working space
exports.applyForCoWorkingSpace = async (req, res) => {
  try {
    const doctorId = req.user.doctors.id;

    const isDataExist = await commonServices.get(CoWorkingSpaces, { where: { id: req.body.co_working_space_id } })
    if (isDataExist == null) {
      return res.status(200).json({ success: "true", message: message.NO_DATA("This co-working space") })
    }

    const isExist = await commonServices.get(CoWorkingSpaceRequests, { where: [{ co_working_space_id: req.body.co_working_space_id }, { doctor_id: doctorId }] })
    if (isExist != null) {
      return res.status(200).json({ success: "true", message: message.ALREADY_APPLIED("request") })
    }

    const obj = {
      co_working_space_id: req.body.co_working_space_id,
      doctor_id: doctorId,
      status: options.CoworkingSpaceStatus.PENDING
    }
    const data = await commonServices.create(CoWorkingSpaceRequests, obj)

    // for push notification -----------
    const clinicId = isDataExist.clinic_id;
    const clinicUser = await commonServices.get(Clinic, { where: { id: clinicId } });
    const clinicUserId = clinicUser.user_id;
    const payload = fcmNotificationPayload.coWorkingSpaceRequest({ userId: clinicUserId });
    await sendAllNotification.sendAllNotification({ payload, /* email: req.body.email, context */ });

    return res.status(200).json({ success: "true", message: message.APPLY_SUCCESS("co-working space") })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};