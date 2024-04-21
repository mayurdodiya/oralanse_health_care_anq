const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const emailTmplateServices = require("../../../../services/email_template")
const sendAllNotification = require("../../../../services/settings");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const commonResponse = require("./common.response.js");
const message = require("../../message");
const options = require('../../../../config/options');
const { where } = require("sequelize");
const { constant } = require("lodash");
const { query } = require("express");
const moment = require('moment');
const Op = db.Sequelize.Op;

const DoctorsEducations = db.doctor_educations;
const DoctorRegistrationDetails = db.doctor_registration_details;
const DoctorSpecialities = db.doctor_specialities;
const DoctorAchievement = db.doctor_achievements;
const DoctorTimings = db.doctor_timings;
const Speciality = db.specialities;
const Area = db.areas;
const City = db.cities;
const Degrees = db.degrees;
const Colleges = db.colleges;
const UserDetails = db.user_details;
const User = db.users;
const Doctors = db.doctors;
const Patients = db.patients;
const UserSubrole = db.user_subroles;
const ClinicStaffs = db.clinic_staffs;
const UserSubRoles = db.user_subroles;
const EnduserAssignRoles = db.enduser_assign_roles;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const HealthAssessmentAnswers = db.health_assessment_answers;
const Clinics = db.clinics;
const HospitalAdmin = db.hospital_admins;



// add employee
exports.addEmployee = async (req, res) => {
    try {
        const doctorId = req.user.doctors.id;
        const adminId = req.user.id;
        const userId = req.user.id;

        const hospitalData = await commonServices.get(HospitalAdmin, { where: { user_id: userId } })
        if (hospitalData != null) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Hospital admin") });
        }
        const clinicData = await commonServices.get(Clinics, { where: { doctor_id: doctorId } })
        const clinicId = clinicData.clinic_id;

        const userRole = await commonServices.get(UserSubrole, { where: { name: req.body.employee_type } })
        const userRoleId = userRole.id;

        const isExist = await commonServices.get(User, { where: { email: req.body.email } })
        if (isExist != null) {
            await contentServices.addClinicStaff({ userId: isExist.id, adminId, clinicId, ...req.body });
            return res.status(200).json({ success: "true", message: message.ADD_DATA("Employee") });
        } else {
            const t = await db.sequelize.transaction()
            try {

                const slug = await commonServices.generateSlug(req.body.full_name);
                let userData = await contentServices.createUserProfile({ slug, adminId, ...req.body }, t);
                let userId = userData.user.id;
                await contentServices.createPatientProfile({ userId, adminId, ...req.body }, t);
                await contentServices.asignUserRole({ userId, roleId: userRoleId }, t)
                await t.commit()
                await contentServices.addClinicStaff({ userId, adminId, clinicId, ...req.body });
                await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId });
                const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
                await sendAllNotification.sendAllNotification({ email: req.body.email, context })

                return res.status(200).json({ success: "true", message: message.ADD_DATA("Employee") });

            } catch (error) {

                await t.rollback()
                return res.status(200).json({ success: "false", message: error.message });
            }
        }
    } catch (error) {

        res.status(200).json({ success: 'false', message: error.message });
    }

};

// edit employee profile
exports.editEmployeeProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const slug = req.params.slug;
        const clinicId = req.user.clinics.id;

        const userData = await commonServices.get(User, { where: { slug: slug } })
        const employeeUserId = userData.id;
        const employeeRoleId = userData.role_id;

        const patientData = await commonServices.get(Patients, { where: { user_id: employeeUserId } })
        var employeePatientId = patientData.id;
        var employeeUniqueId = patientData.unique_id;

        const emailExist = await endUserServices.uniqueEmailUpdate(req.body.email, employeeUserId)
        if (emailExist) {
            const phoneExist = await endUserServices.uniquePhoneUpdate(req.body.phone_no, employeeUserId)
            if (phoneExist) {
                const t = await db.sequelize.transaction()
                try {
                    if (req.body.pincode) {
                        const pincodeData = await pincodeExist(req.body.pincode)
                        if (pincodeData) {
                            return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
                        }
                    }
                    await contentServices.updateUserProfile({ adminId: userId, userId: employeeUserId, roleId: employeeRoleId, ...req.body }, t)
                    await contentServices.updatePatientProfile({ adminId: userId, userId: employeeUserId, unique_id: employeeUniqueId, ...req.body }, t)
                    await contentServices.createOrUpdateUserInsurance({ adminId: userId, userId: employeeUserId, patientId: employeePatientId, ...req.body }, t)
                    await t.commit()
                    await contentServices.updateClinicStaff({ userId: employeeUserId, adminId: userId, clinicId, ...req.body });
                    return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User data") })
                } catch (error) {

                    await t.rollback()
                    return res.status(200).json({ success: "false", message: error.message })
                }
            } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
        } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
    } catch (error) {
        res.status(200).json({
            success: "false",
            message: error.message
        })
    }
};

// delete employee profile
exports.deleteEmployeeProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const slug = req.params.slug;
        const clinicId = req.user.clinics.id;

        const userData = await commonServices.get(User, { where: { slug: slug } })
        const employeeUserId = userData.id;
        const t = await db.sequelize.transaction()
        try {
            await commonServices.delete(EnduserAssignRoles, { where: { user_id: employeeUserId } }, t)
            await commonServices.delete(ClinicStaffs, { where: { user_id: employeeUserId, clinic_id: clinicId } }, t)
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Employee profile") })

        } catch (error) {

            await t.rollback()
            return res.status(200).json({ success: "false", message: error.message });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view all employee
exports.viewAllEmployee = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const { s, page, size } = req.query

        const data = await contentServices.viewAllEmployee({ clinicId, page, size, s })

        if (data.length != 0) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Employee profile"), data: data })
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Employee profile") })
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// View employee attendance
exports.viewAllEmployeeAttendence = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const s = req.query.s;
        const { month } = req.query


        const data = await contentServices.getMonthlyAttendanceCounts({ clinicId, s, month })



        if (data.length != 0) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Employee profile"), data: data })
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Employee profile") })
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view all doctor
exports.viewAllDoctor = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const { page, size, s } = req.query;

        const data = await contentServices.getClinicAllDoctor({ clinicId, page, size, s })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Doctor"), data: data })

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// add doctor profile
exports.addDoctor = async (req, res) => {
    try {
        const adminId = req.user.id;
        const clinicId = req.user.clinics.id;

        const phoneExist = await commonServices.get(User, { where: { phone_no: req.body.phone_no } });
        if (phoneExist != null) {
            return res.status(200).json({ success: "false", message: message.PHONENO_EXIST("User") })
        }

        const emailExist = await commonServices.get(User, { where: { email: req.body.email.toLowerCase() } });
        if (emailExist != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("User email") })
        }

        let role = await commonServices.get(UserSubrole, { where: { name: options.PortalType.DOCTOR } })
        if (!role) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor role") });
        }
        let doctorRoleId = role.id;

        if (req.body.pincode != null) {
            let isPincodeExist = await pincodeExist(req.body.pincode);
            if (isPincodeExist) {
                return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
            }
        }

        const t = await db.sequelize.transaction();
        try {
            const slug = await commonServices.generateSlug(req.body.full_name);
            const userData = await contentServices.createUserProfile({ slug, adminId, ...req.body }, t)
            const doctorUserId = userData.user.id;
            await contentServices.createPatientProfile({ userId: doctorUserId, adminId, ...req.body }, t);
            let doctorData = await contentServices.addDoctor({ userId: doctorUserId, doctorRoleId, ...req.body }, t)
            let doctorId = doctorData.doctor.id;
            await contentServices.addClinicDoctorRelation({ adminId, userId: doctorUserId, clinicId, doctorId, }, t)
            await t.commit();
            const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
        await sendAllNotification.sendAllNotification({ email: req.body.email, context })
            return res.status(200).json({ message: "true", message: message.ADD_DATA("Doctor") });
        } catch (error) {
            await t.rollback()
            res.status(200).json({ success: "false", message: error.message });
        }

    } catch (error) {
        return res.status(200).json({ success: "false", message: error.message });
    }
};

//edit profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        const adminId = req.user.id;
        const clinicId = req.user.clinics.id;
        const slug = req.params.slug;

        const user = await commonServices.get(User, { where: { slug: slug } })
        const doctorUserId = user.id;
        const doctorRoleId = user.role_id;
        const doctor = await commonServices.get(Doctors, { where: { user_id: doctorUserId } });
        const doctorId = doctor.id;
        const patientData = await commonServices.get(Patients, { where: { user_id: doctorUserId } });
        const doctorUniqueId = patientData.unique_id;

        let isDoctorClinicExist = await commonServices.get(ClinicDoctorRelations, { where: { doctor_id: doctorId, clinic_id: clinicId } })
        if (!isDoctorClinicExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
        }

        const role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
        if (!role) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") })
        }

        const isUserRole = await commonServices.verifyUserSubRole(doctorUserId, role.id)
        if (!isUserRole) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor") });
        }

        const emailExist = await endUserServices.uniqueEmailUpdate(req.body.email, doctorUserId)
        if (emailExist) {
            const phoneExist = await endUserServices.uniquePhoneUpdate(req.body.phone_no, doctorUserId)
            if (phoneExist) {
                const t = await db.sequelize.transaction()
                try {
                    if (req.body.pincode) {
                        const pincodeData = await pincodeExist(req.body.pincode)
                        if (pincodeData) {
                            return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
                        }
                    }
                    await contentServices.updateUserProfile({ adminId, userId: doctorUserId, roleId: doctorRoleId, ...req.body }, t)
                    await contentServices.updatePatientProfile({ adminId, userId: doctorUserId, unique_id: doctorUniqueId, ...req.body }, t)
                    await contentServices.updateDoctorProfile({ adminId, userId: doctorUserId, doctorId, ...req.body }, t);
                    await t.commit()
                    return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Doctor data") })
                } catch (error) {
                    await t.rollback()
                    return res.status(200).json({ success: "false", message: error.message })
                }
            } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
        } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// delete doctor profile
exports.deleteDoctorProfile = async (req, res) => {
    try {
        const clinicId = req.user.clinics.id;
        const slug = req.params.slug;

        const userData = await commonServices.get(User, { where: { slug: slug } })
        const employeeUserId = userData.id;
        const doctorData = await commonServices.get(Doctors, { where: { user_id: employeeUserId } })
        const doctorId = doctorData.id
        const t = await db.sequelize.transaction()
        try {
            await commonServices.delete(ClinicDoctorRelations, { where: { doctor_id: doctorId, clinic_id: clinicId } }, t)
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Doctor profile") })

        } catch (error) {

            await t.rollback()
            return res.status(200).json({ success: "false", message: error.message });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view doctors by id
exports.viewDoctorById = async (req, res) => {
    try {

        const Slug = req.params.slug;
        let user = await commonServices.get(User, { where: { slug: Slug } });
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
        }
        const userId = user.id;

        const role = await commonServices.get(UserSubRoles, { where: { name: options.PortalType.DOCTOR } })
        if (!role) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
        }
        const subRoleId = role.id;

        const isUserRole = await commonServices.verifyUserSubRole(userId, subRoleId)
        if (!isUserRole) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
        }

        let query = {
            where: { slug: Slug },
            attributes: ["id", "full_name", "email", "countryCode", "phone_no", "profile_image"],
            include: [
                {
                    model: UserDetails, as: "user_details", attributes: ["address1", "address2"],
                    include: [
                        {
                            model: Area, as: "areas", required: false, attributes: ["id", "pincode"],
                            include: [
                                { model: City, as: "cities", required: false, attributes: ["id", "city_name", "state_name", "country_name"] },
                            ]
                        },
                    ]
                },
                {
                    model: Doctors, as: "doctors", attributes: ["id", "status", "doctor_type", "experience", "createdAt", "document_type", "front_side_document", "back_side_document"],
                    include: [
                        {
                            model: DoctorsEducations, as: "doctor_educations", required: false, attributes: ["id", "year"],
                            include: [
                                { model: Degrees, as: "degrees", required: false, attributes: ["id", "name"] },
                                { model: Colleges, as: "colleges", required: false, attributes: ["id", "name"] },
                            ]
                        },
                        {
                            model: DoctorSpecialities, as: "doctor_specialities", required: false, attributes: ["id", "doctor_id"],
                            include: [
                                { model: Speciality, as: "specialities", required: false, attributes: ["id", "name", "image_path"] },
                            ]
                        }
                    ]
                },

            ]
        }
        const data = await commonServices.get(User, query);
        const responseData = JSON.parse(JSON.stringify(data))
        const modifyResponse = commonResponse.modifyResponse(responseData)

        if (data != null) {
            res.status(200).json({ success: "true", message: message.GET_DATA("Doctor profile"), data: modifyResponse });
        } else {
            res.status(200).json({ success: "false", message: message.NO_DATA("Doctor profile") });
        }


    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// view all employee payout pending***
exports.viewAllEmployeePayout = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const { s, page, size } = req.query

        const data = await contentServices.viewAllEmployeePayout({ clinicId, page, size, s })

        if (data.length != 0) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Employee profile"), data: data })
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Employee profile") })
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};

// view all health assessments question
exports.viewAllHealtAssessmentQuiz = async (req, res) => {

    try {
        const { page, size, s } = req.query;

        const data = await contentServices.viewAllHealtAssessmentQuiz({ page, size, s })

        if (data) {

            data.data.map(item => {
                item.options = JSON.parse(item.options)
            });

            res.status(200).json({ success: "true", message: message.GET_DATA("Health assessment question"), data: data })
        } else {
            res.status(200).json({ success: "false", message: message.NO_DATA("Health assessments question") })
        }

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// Emplyee health assessment quiz answer
exports.addHealtAssessmentQuizAnswer = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = { where: { user_id: userId, question_id: req.body.question_id, answers: req.body.answers } };
        const isExistingData = await commonServices.get(HealthAssessmentAnswers, query);

        if (isExistingData != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("Your health assessments answer") });
        }

        let obj = {
            user_id: userId,
            question_id: req.body.question_id,
            answers: req.body.answers,
            createdBy: userId
        }
        const data = await commonServices.create(HealthAssessmentAnswers, obj)
        if (data) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Health assessments answer"), })
        } else {
            res.status(200).json({ success: "false", message: message.CREATE_FAILD("Health assessments answer") });
        }

    } catch (error) {

        res.status(200).json({ success: " false", message: error.message });
    }
}
