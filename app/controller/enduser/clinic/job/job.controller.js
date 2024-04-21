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



const Jobs = db.jobs;
const User = db.users;
const JobApplicants = db.job_applicants;



// add job
exports.addJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id
        const data = await contentServices.addJob({ clinicId, userId, ...req.body })
        if (data) {
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Job") });
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Job") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// update job by id
exports.editJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const data = await contentServices.editJob({ userId, ...req.body, id: id })
        res.status(200).json({
            success: "true",
            message: message.UPDATE_PROFILE("Job")
        });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// delete job by id
exports.deleteJob = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await commonServices.delete(Jobs, { where: { id: id } })
        res.status(200).json({
            success: "true",
            message: message.DELETE_PROFILE("Job")
        });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view job by id
exports.viewJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await contentServices.viewJobDetail({ id })
        if (data) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Job"), data: data });
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Job") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view clinic all job and searching
exports.viewClinicAllJob = async (req, res) => {

    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const { s, page, size } = req.query

        const data = await contentServices.getClinicAllJob({ userId, clinicId, s, page, size })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Job"), data: data });

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// view all job
exports.jobListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { s, page, size } = req.query;
        const data = await contentServices.viewAllJob({ userId, s, page, size })
        res.status(200).json({ success: "true", message: message.GET_DATA("Jobs"), data: data })

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// apply for job
exports.applyForJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobId = req.params.id;
        console.log(userId,"isUserExist isUserExist isUserExist isUserExist");

        const isUserExist = await commonServices.get(User, { where: { email: req.body.email } })
        if (!isUserExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("email") })
        }
        const isExist = await commonServices.get(JobApplicants, { where: { user_id: userId, job_id: jobId } })
        if (isExist) {
            return res.status(200).json({ success: "false", message: message.JOB_APPLIED("You") })
        }

        await contentServices.applyForJob({ userId, jobId, ...req.body, jobId });
        return res.status(200).json({ success: "true", message: message.APPLY_SUCCESS("job") });
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// job Applicants listing by (job)id
exports.jobApplicantsListingById = async (req, res) => {
    try {
        const id = req.params.id;
        const { s, page, size } = req.query;
        const data = await contentServices.jobApplicantsListing({ id, s, page, size })
        res.status(200).json({ success: "true", message: message.GET_DATA("Job applicants"), data: data })

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view applicant details
exports.ViewApplicantsDetailById = async (req, res) => {
    try {

        const id = req.params.id;
        const data = await contentServices.viewApplicantsDetails({ id })
        res.status(200).json({ success: "true", message: message.GET_DATA("Job applicant"), data: data })

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};