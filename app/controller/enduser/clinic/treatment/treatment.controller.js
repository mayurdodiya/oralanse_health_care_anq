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
const Patients = db.patients;
const Clinics = db.clinics;
const ClinicStaffs = db.clinic_staffs;
const ClinicTreatments = db.clinic_treatments;
const ClinicStaffAattendances = db.clinic_staff_attendances;


// add treatment
exports.addTreatment = async (req, res) => {

    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const parentTreatmentId = req.body.parent_treatment_id
        const query = {
            where: [{ clinic_id: clinicId }, { treatment_id: req.body.treatment_id }]
        }
        if (parentTreatmentId != "null") {
            query.where.push({ parent_treatment_id: parentTreatmentId })
        }
        console.log(query, "-------------------------------------------------------");
        const isExist = await commonServices.get(ClinicTreatments, query)
        if (isExist != null) {
            return res.status(200).json({ success: "true", message: message.DATA_EXIST("This treatment") });
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
exports.updateTreatment = async (req, res) => {

    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const id = req.params.id;
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
exports.deleteTreatment = async (req, res) => {

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
exports.viewAllTreatments = async (req, res) => {

    try {
        const userId = req.user.id;
        const { page, size, s } = req.query;

        const isClinic = await commonServices.get(Clinics, { where: { user_id: userId } })
        if (!isClinic) {
            return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER });
        }
        const clinicId = isClinic.id;
        console.log(clinicId);

        const data = await contentServices.getAllClinicTreatments({ page, size, s, userId, clinicId, ...req.body })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Treatment"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// view treatment by id
exports.viewClinicTreatmentById = async (req, res) => {

    try {
        const userId = req.user.id;
        const treatmentId = req.params.id;

        const isClinic = await commonServices.get(Clinics, { where: { user_id: userId } })
        if (!isClinic) {
            return res.status(200).json({ success: "false", message: message.NO_CLINIC_OWNER });
        }
        const clinicId = isClinic.id;

        const data = await contentServices.viewClinicTreatmentByid({ userId, treatmentId })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Treatment"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};