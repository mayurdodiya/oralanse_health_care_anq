const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: clinicServices } = require("../../../../services/clinic");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment');
const Op = db.Sequelize.Op;



const Beds = db.beds;




// add bed
exports.addBeds = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const query = { where: [{ clinic_id: clinicId }, { room_number: req.body.room_number }, { bed_number: req.body.bed_number }] }
        const isExist = await commonServices.get(Beds, query)
        if (isExist) {
            return res.status(200).json({ success: "true", message: message.DATA_EXIST("This bed data") });
        }

        await clinicServices.addBeds({ clinicId, userId, ...req.body })
        res.status(200).json({ success: "true", message: message.ADD_DATA("Beds") })
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// update bed by id
exports.editBeds = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const id = req.params.id;
        await clinicServices.updateBeds({ userId, clinicId, ...req.body, id })
        return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Bed") });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// delete bed by id
exports.deleteBeds = async (req, res) => {
    try {
        const id = req.params.id;
        await commonServices.delete(Beds, { where: { id: id } })
        res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Bed") });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view all bed and searching
exports.viewAllBeds = async (req, res) => {

    try {
        const clinicId = req.user.clinics.id;
        console.log(clinicId);
        const { s, page, size } = req.query

        const data = await clinicServices.getClinicAllBed({ clinicId, s, page, size })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Bed"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};