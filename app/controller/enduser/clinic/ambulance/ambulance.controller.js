const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const message = require("../../message");
const Op = db.Sequelize.Op;
const emailTmplateServices = require("../../../../services/email_template")
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");



const User = db.users;
const Ambulances = db.ambulances;
const AmbulanceRequest = db.ambulance_requests;




// add ambulance
exports.addAmbulance = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;

        const query = { where: { vehicle_no: req.body.vehicle_no } };
        const isExistingData = await commonServices.get(Ambulances, query);

        if (isExistingData != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This ambulance data") });
        }

        const data = await contentServices.addAmbulance({ clinicId, userId, ...req.body })
        if (data) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Ambulance") })
        } else {
            res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Ambulance") });
        }

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message });
    }
}

// edit ambulance by id
exports.updateAmbulanceById = async (req, res) => {
    try {

        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const id = req.params.id
        const user = await commonServices.get(Ambulances, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This ambulance") });
        }

        const query = { where: [{ vehicle_no: req.body.vehicle_no, clinic_id: clinicId }, { id: { [Op.ne]: [id] } }] };
        let isExisting = await commonServices.get(Ambulances, query);
        if (isExisting) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This ambulance") });
        }

        const data = await contentServices.updateAmbulance({ userId, clinicId, ...req.body, id })
        if (data) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Ambulance"), });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("Ambulance"), });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete ambulance by id
exports.deleteAmbulanceById = async (req, res) => {
    try {

        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const user = await commonServices.get(Ambulances, { where: { id: id, clinic_id: clinicId } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This ambulance") });
        }

        let data = await commonServices.delete(Ambulances, { where: { id: id } });
        if (data > 0) {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Ambulance"), });
        } else {
            return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Ambulance") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view ambulance by id
exports.viewAmbulanceById = async (req, res) => {

    try {
        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.getAmbulanceById({ id, clinicId })
        if (response == null) {
            return res.status(200).json({ success: "true", message: message.NO_DATA("This ambulance") })
        }
        return res.status(200).json({ success: "true", message: message.GET_DATA("Ambulance"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// view all ambulance 
exports.viewAllAmbulance = async (req, res) => {

    try {
        const { page, size, s } = req.query;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.getAllAmbulance({ page, size, s, clinicId })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Ambulance"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// view ambulance all requset
exports.viewAmbulanceAllRequest = async (req, res) => {

    try {
        const { page, size, s, status } = req.query;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.getAllAmbulanceRequest({ page, size, s, clinicId, status })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Ambulance"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// change request status (accept, declain, completed)
exports.changeAmbulanceRequestStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const status = req.body.status;
        const user = await commonServices.get(AmbulanceRequest, { where: { id: id } })
        const applicantUserId = user.user_id;
        const data = await contentServices.changeAmbulanceRequestStatus({ id, status, userId, applicantUserId, ...req.body })

        if (data == true) {

            // for push notification -----------
            var fcmStatus = '';
            if (status == "accept") {
                fcmStatus = "accepted"
            }
            if (status == "decline") {
                fcmStatus = "declined"
            }
            if (status == "completed") {
                fcmStatus = "completed"
            }

            const userData = await commonServices.get(User, { where: { id: applicantUserId } })
            const fullName = userData.full_name;
            const email = userData.email;
            const context = await emailTmplateServices.getAmbulanceRequestAcceptAndDeclineContext({ /* add changes valus as template require */ });
            const payload = fcmNotificationPayload.acceptAndDeclineAmbulanceRequest({ userId: applicantUserId, body: fcmStatus });
            await sendAllNotification.sendAllNotification({ payload, email: email, context });

            return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Ambulance request status") })
        }

    } catch (error) {
        res.status(200).json({ success: 'false', message: error.message });
    }

};