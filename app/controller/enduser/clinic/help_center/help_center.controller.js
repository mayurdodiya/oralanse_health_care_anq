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




const Faqs = db.faqs;




//get all faq questation answer list
exports.getAllFaqQuestionAndAnswer = async (req, res) => {
    try {
        const type = 'hospital';
        const query = {
            where: [{ type: type }],
            attributes: ['id', 'question', 'answer']
        }
        const data = await commonServices.getAll(Faqs, query)
        return res.status(200).json({ success: "true", message: message.GET_LIST("Faq questation and answer"), data: data })
    } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
    }
};