const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: clinicServices } = require("../../../../services/clinic")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment');
const Op = db.Sequelize.Op;



const LabTestClinics = db.lab_test_clinics;
const LabTestPatients = db.lab_test_patients;
const AppointmentRequests = db.appointment_requests;


// add clinic lab tests
exports.addLabTests = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const isExist = await commonServices.get(LabTestClinics, { where: [{ clinic_id: clinicId }, { lab_test_id: req.body.lab_test_id }] })
        if (isExist) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This clinic test") });
        }

        await clinicServices.addClinicTests({ userId, clinicId, ...req.body })
        res.status(200).json({ success: "true", message: message.ADD_DATA("Clinic test") });
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// update clinic lab test by id
exports.updateLabTests = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;

        const isExist = await commonServices.get(LabTestClinics, { where: [{ lab_test_id: req.body.lab_test_id }, { id: { [Op.ne]: id } }] })
        if (isExist != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This clinic test") });
        }

        const data = await clinicServices.updateClinicTests({ userId, ...req.body, id: id })
        res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Clinic test") });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// update clinic lab test by id
exports.deleteLabTests = async (req, res) => {
    try {
        const id = req.params.id;

        const isExist = await commonServices.get(LabTestClinics, { where: { id: id } })
        if (!isExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This clinic test") });
        }

        const data = await commonServices.delete(LabTestClinics, { where: { id: id } })
        if (data) {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Clinic test") });
        } else {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE_FAILED("Clinic test") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view clinic lab test by id
exports.viewClinicLabTestById = async (req, res) => {
    try {
        const id = req.params.id;

        const isExist = await commonServices.get(LabTestClinics, { where: { id: id } })
        if (!isExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This clinic test") });
        }

        const data = await clinicServices.viewClinicLabTestById({ id })
        res.status(200).json({ success: "true", message: message.GET_DATA("Clinic test"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};


// view clinic all lab tests
exports.getClinicAllLabTest = async (req, res) => {
    try {
        const { s, page, size } = req.query;
        const clinicId = req.user.clinics.id;
        console.log(clinicId, '----------------clinicidfoifjeoifoiffnononoignoigvoi---------');
        const data = await clinicServices.getClinicAllLabTest({ clinicId, s, page, size })
        res.status(200).json({ success: "true", message: message.GET_DATA("Clinic test"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// // view all lab tests request old
// exports.viewAllLabTestRequest = async (req, res) => {
//     try {
//         // const clinicId = req.user.clinics.id;
//         const clinicId = 22;
//         console.log(clinicId,"-------------");
//         const { s, page, size, status } = req.query;
//         const data = await clinicServices.viewAllLabTestRequest({ clinicId, s, page, size, status })

//         let pendingReportquery = {
//             where: [{ status: options.labTestStatus.PENDING }],
//             attributes: ['id', 'appointment_id', 'patient_id', 'doctor_id', 'lab_test_id'],
//             include: [
//                 { model: LabTestClinics, as: 'labtestClinics', where: { clinic_id: clinicId }, attributes: ['price'] }
//             ]
//         };
//         const pendingReport = await commonServices.getAll(LabTestPatients, pendingReportquery)

//         let completedReportquery = {
//             where: [{ status: options.labTestStatus.COMPLETED }],
//             attributes: ['id', 'appointment_id', 'patient_id', 'doctor_id', 'lab_test_id'],
//             include: [
//                 { model: LabTestClinics, as: 'labtestClinics', where: { clinic_id: clinicId }, attributes: ['price'] }
//             ]
//         };
//         const completedReport = await commonServices.getAll(LabTestPatients, completedReportquery)

//         res.status(200).json({
//             success: "true",
//             message: message.GET_DATA("Lab test request"),
//             data: {
//                 totalItems: data.totalItems,
//                 pendingReport: pendingReport.length,
//                 completedReport: completedReport.length,
//                 data: data.data,
//                 totalPages: data.totalPages,
//                 currentPage: data.currentPage,
//             }
//         });

//     } catch (error) {
//         res.status(200).json({ success: "false", message: error.message })
//     }
// };

exports.viewAllLabTestRequest = async (req, res) => {
    try {
        const clinicId = req.user.clinics.id;
        const { s, page, size, status } = req.query;
        const data = await clinicServices.viewAllLabTestRequest({ clinicId, s, page, size, status })

        let pendingReportquery = {
            where: [{ status: options.labTestStatus.PENDING }],
            attributes: ['id', 'appointment_id', 'patient_id', 'doctor_id', 'lab_test_id'],
            include: [
                { model: LabTestClinics, as: 'labtestClinics', where: { clinic_id: clinicId }, attributes: ['price'] }
            ]
        };
        const pendingReport = await commonServices.getAll(LabTestPatients, pendingReportquery)

        let completedReportquery = {
            where: [{ status: options.labTestStatus.COMPLETED }],
            attributes: ['id', 'appointment_id', 'patient_id', 'doctor_id', 'lab_test_id'],
            include: [
                { model: LabTestClinics, as: 'labtestClinics', where: { clinic_id: clinicId }, attributes: ['price'] }
            ]
        };
        const completedReport = await commonServices.getAll(LabTestPatients, completedReportquery)

        res.status(200).json({
            success: "true",
            message: message.GET_DATA("Lab test request"),
            data: {
                totalItems: data.totalItems,
                pendingReport: pendingReport.length,
                completedReport: completedReport.length,
                data: data.data,
                totalPages: data.totalPages,
                currentPage: data.currentPage,
            }
        });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};


// // accept & decline lab test request
// exports.acceptAndDeclineRequest = async (req, res) => {
//     try {
//         const clinicId = req.user.clinics.id;
//         const userId = req.user.id;
//         const id = req.params.id; // lab_test_patients table id
//         const status = req.body.status;

//         const data = await clinicServices.acceptAndDeclineRequest({ id, userId, status })
//         if (data[0] == 1) {
//             return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Lab test request status") });
//         } else {
//             return res.status(200).json({ success: "true", message: message.CHANGE_DATA_FAILED("Lab test request status") });
//         }
//     } catch (error) {
//         res.status(200).json({ success: "false", message: error.message })
//     }
// };
// accept & decline lab test request
exports.acceptAndDeclineRequest = async (req, res) => {
    try {
        // const clinicId = req.user.clinics.id;
        const userId = req.user.id;
        const appointmentReqId = req.params.id; // appointment req id in params
        const status = req.body.status;

        const appointmentReqData = await commonServices.get(AppointmentRequests, { where: [{ id: appointmentReqId }] })
        if (!appointmentReqData) {
            return res.status(200).json({ success: "true", message: message.NO_DATA("This appointment request data") });
        }
        const appointmentId = appointmentReqData.appointment_id;

        const data = await clinicServices.acceptAndDeclineRequest({ appointmentId, appointmentReqId, userId, status })
        if (data == true) {
            return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Lab test request status") });
        } else {
            return res.status(200).json({ success: "true", message: message.CHANGE_DATA_FAILED("Lab test request status") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// add test for patient request -->
exports.addTestValueForPatient = async (req, res) => {
    try {
        const clinicId = req.user.clinics.id;
        const userId = req.user.id;
        const id = req.params.id; // lab_test_patients table id

        const obj = {
            result_value: req.body.result_value,
            generic_comment: req.body.generic_comment,
            updateBy: userId
        }
        const data = await commonServices.update(LabTestPatients, { where: { id: id } }, obj)
        if (data[0] == 1) {
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Lab test") })
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};