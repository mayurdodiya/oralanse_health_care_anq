const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const commonResponse = require("./common.response");
const message = require("../../message");
const moment = require('moment');
const options = require("../../../../config/options");
const Op = db.Sequelize.Op;


const BloodBanks = db.blood_banks;
const BloodParticipants = db.blood_participants;




// get all blood type of clinic
exports.clinicAllBloodTypeListing = async (req, res) => {

    try {
        const clinicId = req.user.clinics.id;
        const { page, size } = req.query;
        const data = await contentServices.getClinicAllBloodType({ page, size, clinicId })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Clinic blood type"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// create donor profile
exports.addDonor = async (req, res) => {
    try {
        const user = req.user;
        const userId = req.user.id;
        const adminId = req.user.id;
        const clinicId = req.user.clinics.id;


        const isBloodBankExist = await commonServices.get(BloodBanks, { where: { id: req.body.blood_bank_id } })
        if (!isBloodBankExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This blood bank blood type") });
        }

        const isPhoneExist = await commonServices.get(BloodParticipants, { where: { phone_no: req.body.phone_no } })
        if (isPhoneExist != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This phone number") });
        }

        const data = await contentServices.addDonor({ adminId, clinicId, ...req.body })
        if (data) {
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Donor") })
        } else {
            return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Donor") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// update donor profile
exports.updateDonor = async (req, res) => {

    try {
        const adminId = req.user.id;
        const id = req.params.id;

        const isExist = await commonServices.get(BloodParticipants, { where: [{ phone_no: req.body.phone_no }, { id: { [Op.ne]: [id] } }] })
        if (isExist != null) {
            return res.status(200).json({ success: "true", message: message.DATA_EXIST("This phone number") });
        }
        const data = await contentServices.updateDonor({ adminId, id, ...req.body })
        if (data) {
            return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User") });
        } else {
            return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE_FAILED("User") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// delete donor profile
exports.deleteDonor = async (req, res) => {

    try {
        const id = req.params.id;
        const data = await commonServices.delete(BloodParticipants, { where: { id: id } })

        if (data) {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Donor") });
        } else {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE_FAILED("Donor") });
        }

    } catch (error) {

        res.status(200).json({ success: "false", message: error.message });
    }
};

// view donor profile by id
exports.viewDonorById = async (req, res) => {

    try {
        const id = req.params.id;
        const data = await contentServices.viewDonorDetails({ id })
        console.log(JSON.parse(JSON.stringify(data)));
        // const response = commonResponse.donorResponse(data)
        const response = JSON.parse(JSON.stringify(data))
        if (data) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Donor"), data: response });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// view all donor/recipient
exports.viewAllDonorOrRecipient = async (req, res) => {

    try {
        const id = req.params.id;
        const { type, page, size, s } = req.query;
        const bloodTypeId = req.body.blood_type_id;
        const clinicId = req.user.clinics.id;
        const data = await contentServices.viewAllDonorOrRecipient({ clinicId, id, type, bloodTypeId, page, size, s })

        if (data) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Donor"), data: data });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// add clinic blood bank
exports.addClinicBloodBank = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        console.log(clinicId);
        const data = await contentServices.addClinicBloodBank({ userId, clinicId, })
        if (data) {
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Clinic blood bank") })
        } else {
            return res.status(200).json({ success: "true", message: message.DATA_EXIST("Clinic blood bank") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// change blood stock
exports.changeBloodStock = async (req, res) => {

    try {
        const id = req.params.id;
        const clinicId = req.user.clinics.id;
        const stock = req.query.stock;
        const user = await commonServices.get(BloodBanks, { where: { id: id, clinic_id: clinicId } })
        const oldStock = user.stock;

        if (stock == "increse") {
            const finalStock = oldStock + req.body.stock;
            var data = await commonServices.update(BloodBanks, { where: { id: id } }, { stock: finalStock })
            if (data) {
                return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Blood stock") });
            }
        }
        if (stock == "decrese") {
            var finalStock = oldStock - req.body.stock;
            const data = await commonServices.update(BloodBanks, { where: { id: id } }, { stock: finalStock })
            if (data) {
                return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Blood stock") });
            }
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};
