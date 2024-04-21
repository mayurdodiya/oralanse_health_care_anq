const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment');
const Op = db.Sequelize.Op;


const User = db.users;
const Clinics = db.clinics;
const Patients = db.patients;
const ClinicStaffs = db.clinic_staffs;
const ClinicTreatments = db.clinic_treatments;
const ClinicStaffAattendances = db.clinic_staff_attendances;


// add treatment in doctor's clinic
exports.addClinicTreatment = async (req, res) => {

    try {
        const userId = req.user.id;
        const isClinic = await commonServices.get(Clinics, { where: { user_id: userId } })
        if (!isClinic) {
            return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER });
        }
        const clinicId = isClinic.id;

        const isExist = await commonServices.get(ClinicTreatments, { where: { clinic_id: clinicId, treatment_id: req.body.treatment_id } })
        if (isExist != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This treatment") });
        }

        const data = await contentServices.addClinicTreatment({ userId, clinicId, ...req.body })
        if (data) {
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Treatment") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// update treatment
exports.updateClinicTreatment = async (req, res) => {

    try {
        const userId = req.user.id;
        const id = req.params.id;

        const isClinic = await commonServices.get(Clinics, { where: { user_id: userId } })
        if (!isClinic) {
            return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER });
        }
        const clinicId = isClinic.id;

        const isExist = await commonServices.get(ClinicTreatments, { where: [{ clinic_id: clinicId }, { treatment_id: req.body.treatment_id }, { id: { [Op.ne]: [id] } }] })
        if (isExist != null) {
            return res.status(200).json({ success: "true", message: message.DATA_EXIST("This treatment") });
        }

        const data = await contentServices.updateClinicTreatment({ userId, clinicId, id, ...req.body })
        if (data) {
            return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Treatment") });
        } else {
            return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE_FAILED("Treatment") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// delete treatment
exports.deleteClinicTreatment = async (req, res) => {

    try {
        const id = req.params.id;
        const data = await commonServices.delete(ClinicTreatments, { where: { id: id } });
        const deleteChildData = await commonServices.delete(ClinicTreatments, { where: { parent_treatment_id: id } });

        return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Treatment") });


    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// view all treatment
exports.viewAllClinicTreatments = async (req, res) => {

    try {
        const userId = req.user.id;
        const treatmentId = req.params.id;
        const { page, size, s } = req.query;

        const isClinic = await commonServices.get(Clinics, { where: { user_id: userId } })
        if (!isClinic) {
            return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER });
        }
        const clinicId = isClinic.id;

        const data = await contentServices.getAllClinicTreatments({ page, size, s, userId, treatmentId, clinicId, ...req.body })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Treatment"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};