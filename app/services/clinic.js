const db = require('../../app/models');
const jwt = require('jsonwebtoken');
const moment = require("moment");
const { methods: commonServices } = require("./common");
const options = require("../config/options");
const Op = db.Sequelize.Op;



const HealthCamp = db.health_camps;
const CampPatients = db.camp_patients;
const Banners = db.banners;
const Beds = db.beds;
const LabTestClinics = db.lab_test_clinics;
const LabTestPatients = db.lab_test_patients;
const ClinicBanners = db.clinic_banners;
const OralScreeningReports = db.oral_screening_reports;
const OralScreeningRequests = db.oral_screening_requests;
const User = db.users;
const UserDetails = db.user_details;
const Patient = db.patients;
const OralDoctors = db.oral_doctors;
const OralScreeningAnswers = db.oral_screening_answers;
const OralScreeningQuiz = db.oral_screening_quiz;
const OralScreeningMedias = db.oral_screening_medias;
const OralDentalChart = db.oral_dental_chart;
const HealthAssessmentReports = db.health_assessment_reports;
const Medicines = db.medicines;
const Specialities = db.specialities;
const Diseases = db.diseases;
const LabTests = db.lab_tests;
const LabTestsValues = db.lab_test_values;
const Doctors = db.doctors;
const InsuranceCompanies = db.insurance_companies;
const AppointmentRequests = db.appointment_requests;
const Appointments = db.appointments;



const methods = {

    addHealthCamp: async (data) => {
        try {

            let obj = {
                clinic_id: data.clinicId,
                name: data.name,
                doctor_id: data.doctor_id,
                description: data.description,
                location: data.location,
                start_date: data.start_date,
                end_date: data.end_date,
                image_url: data.image_url,
                createdBy: data.userId
            }
            const addHealthCamp = await commonServices.create(HealthCamp, obj)
            return addHealthCamp
        } catch (error) {
            throw error
        }
    },
    updateHealthCamp: async (data) => {
        try {
            const obj = {
                name: data.name,
                doctor_id: data.doctor_id,
                description: data.description,
                location: data.location,
                start_date: data.start_date,
                end_date: data.end_date,
                image_url: data.image_url,
                updatedBy: data.userId,
            }
            let updateData = await commonServices.update(HealthCamp, { where: { id: data.id, clinic_id: data.clinicId } }, obj);

            return updateData
        } catch (error) {
            throw error
        }
    },
    getAllHealthCamp: async (data) => {
        try {
            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { name: { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj, { clinic_id: data.clinicId }],
                attributes: ['id', 'name', 'description', 'location', 'image_url'],
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(HealthCamp, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    getAllHealthCampPatients: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { full_name: { [Op.like]: `%${data.s}%` } },
                        { phone_no: { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj, { camp_id: data.campId }],
                attributes: ['id', 'full_name', 'phone_no'],
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(CampPatients, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    getClinicAllBanners: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { '$banners.title$': { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj, { clinic_id: data.clinicId }],
                attributes: ['id'],
                include: [
                    { model: Banners, as: "banners", attributes: ['id', 'banner_type', 'title', 'description', 'link'] }
                ]
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(ClinicBanners, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    addBeds: async (data) => {
        try {

            let obj = {
                clinic_id: data.clinicId,
                room_number: data.room_number,
                bed_number: data.bed_number,
                status: options.BedAllotmentStatus.VACCANT,
                createdBy: data.userId
            }
            const addBeds = await commonServices.create(Beds, obj)
            return addBeds
        } catch (error) {
            throw error
        }
    },
    updateBeds: async (data) => {
        try {
            const obj = {
                room_number: data.room_number,
                bed_number: data.bed_number,
                updatedBy: data.userId,
            }
            let updateData = await commonServices.update(Beds, { where: { id: data.id, clinic_id: data.clinicId } }, obj);

            return updateData
        } catch (error) {
            throw error
        }
    },
    getClinicAllBed: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { room_number: { [Op.like]: `%${data.s}%` } },
                        { bed_number: { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj, { clinic_id: data.clinicId }],
                attributes: ['id', 'room_number', 'bed_number', 'status', 'createdAt'],
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(Beds, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    viewAllScreeningReports: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { patient_id: { [Op.like]: `%${data.s}%` } },
                        { "$users_screening.full_name$": { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj, { status: data.status }],
                attributes: ['id', 'user_id', 'patient_id', /* 'oral_doctor_id', */ 'qa_oral_doctor_id', 'status', 'createdAt'],
                include: [
                    {
                        model: OralDoctors, as: 'oral_screening_doctors', required: false, attributes: ['id'],
                        include: [
                            { model: User, as: 'users_oral_doctor', attributes: ['full_name'] }
                        ]
                    },
                    {
                        model: User, as: 'users_screening', attributes: ['id', 'full_name', 'profile_image'],
                        include: [
                            { model: Patient, as: 'patients', attributes: ['id', 'unique_id'], }
                        ]
                    },
                ]
            };


            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(OralScreeningReports, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    shareOralScreeningReport: async (data) => {
        try {
            const t = await db.sequelize.transaction();
            try {
                const reqArr = []
                if (data.id.length != 0) {
                    for (let z = 0; z < data.id.length; z++) {
                        for (let j = 0; j < data.doctor_id.length; j++) {
                            reqArr.push({
                                oral_screening_report_id: data.getData[z].id,
                                patient_id: data.getData[z].patient_id,
                                oral_doctor_id: data.doctor_id[j],
                                status: options.oralScreeningReportStatus.PENDING,
                                createdBy: data.adminId,
                            })
                        }
                    }
                }
                const shareOralReq = await commonServices.bulkCreate(OralScreeningRequests, reqArr, { transaction: t })
                if (!shareOralReq) {
                    await t.rollback()
                    return false
                }

                await t.commit();
                return true

            } catch (error) {
                await t.rollback();
                return false
            }

        } catch (error) {
            return false
        }
    },
    viewScreeningReportDetail: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'oral_doctor_id', 'qa_oral_doctor_id', 'status'],
                include: [
                    {
                        model: User, as: 'users_screening', attributes: ['id', 'full_name', 'email', 'phone_no', 'profile_image'],
                        include: [
                            { model: UserDetails, as: 'user_details', attributes: ['pincode', 'address1', 'gender',] },
                            { model: Patient, as: 'patients', attributes: ['unique_id', 'relationship'] },
                        ]
                    },
                    {
                        model: OralScreeningAnswers, as: 'oral_screening_answers', attributes: ['id', 'answers'],
                        include: [
                            { model: OralScreeningQuiz, as: 'oral_screening_quiz', attributes: ['id', 'question'] },
                        ]
                    },
                ]
            };
            let response = await commonServices.get(OralScreeningReports, query)
            response.oral_screening_answers.map(item => {
                item.answers = JSON.parse(item.answers)
            })
            let responseData = JSON.parse(JSON.stringify(response))

            return responseData

        } catch (error) {
            throw error
        }
    },
    viewAssignedDoctorReportDetail: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'oral_doctor_id', 'qa_oral_doctor_id', 'status'],
                include: [
                    {
                        model: OralDoctors, as: 'oral_screening_doctors', attributes: ['id'],
                        include: [
                            {
                                model: User, as: 'users_oral_doctor', attributes: ['full_name', 'email']
                            },
                        ]
                    },
                    { model: OralScreeningMedias, as: 'oral_screening_medias', attributes: ['id', 'image_type', 'image_url', 'doctor_quizz', 'doctor_quizz'] },
                    { model: OralDentalChart, as: 'oral_dental_chart', attributes: ['id', 'chart_type', 'dental_diseases'] }
                ]
            };

            let response = await commonServices.get(OralScreeningReports, query)

            response.oral_screening_medias.map(item => {
                item.doctor_quizz = JSON.parse(item.doctor_quizz)
            })
            response.oral_dental_chart.map(item => {
                item.dental_diseases = JSON.parse(item.dental_diseases)
            })

            let responseData = JSON.parse(JSON.stringify(response))

            return responseData

        } catch (error) {
            throw error
        }
    },
    viewQaAssignedReportDetail: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'oral_doctor_id', 'qa_oral_doctor_id', 'status'],
                include: [
                    {
                        model: OralDoctors, as: 'oral_screening_doctors', attributes: ['id'],
                        include: [
                            {
                                model: User, as: 'users_oral_doctor', attributes: ['full_name', 'email']
                            },
                        ]
                    },
                    { model: OralScreeningMedias, as: 'oral_screening_medias', attributes: ['id', 'image_type', 'image_url', 'doctor_quizz', 'doctor_quizz', 'notes'] },
                    { model: OralDentalChart, as: 'oral_dental_chart', attributes: ['id', 'chart_type', 'dental_diseases'] }
                ]
            };

            let response = await commonServices.get(OralScreeningReports, query)

            response.oral_screening_medias.map(item => {
                item.doctor_quizz = JSON.parse(item.doctor_quizz)
            })
            response.oral_dental_chart.map(item => {
                item.dental_diseases = JSON.parse(item.dental_diseases)
            })

            let responseData = JSON.parse(JSON.stringify(response))

            return responseData

        } catch (error) {
            throw error
        }
    },
    changeScreeningReportsStatusById: async (data) => {
        try {
            const t = await db.sequelize.transaction();
            try {

                const obj = {}
                if (data.status == options.oralScreeningReportStatus.COMPLETED) {
                    obj.status = options.oralScreeningReportStatus.COMPLETED
                }
                if (data.status == options.oralScreeningReportStatus.CANCELLED) {
                    obj.status = options.oralScreeningReportStatus.CANCELLED
                }

                let user = await commonServices.update(OralScreeningReports, { where: [{ id: data.id }, { status: options.oralScreeningReportStatus.QAASSIGNED }] }, obj, { transaction: t })
                let users = await commonServices.update(OralScreeningRequests, { where: [{ oral_screening_report_id: data.id }, { status: options.oralScreeningReportStatus.QAASSIGNED }] }, obj, { transaction: t })

                await t.commit();
                return true
            } catch (error) {
                await t.rollback();
                return false
            }

        } catch (error) {
            throw error
        }
    },
    viewAllHealthAssessmentReports: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { patient_id: { [Op.like]: `%${data.s}%` } },
                        { "$users_screening.full_name$": { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj],
                attributes: ['id', 'user_id', 'score', 'tips', 'treatments', 'createdAt'],
                order: [["id", "DESC"], ["createdAt", "DESC"]]
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(HealthAssessmentReports, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    viewAllMyScreeningRequest: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        // { patient_id: { [Op.like]: `%${data.s}%` } },
                        // { "$oral_screening_requests.oral_screening_patients.usersData.full_name$": { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj],
                attributes: ['id', 'status', 'createdAt'],
                include: [
                    {
                        model: OralScreeningRequests, as: 'oral_screening_requests', required: true, where: [{ oral_doctor_id: data.oralDoctorId }, /* { status: data.status } */],
                        attributes: ['id', 'patient_id', 'oral_doctor_id', 'status'],
                        include: [
                            {
                                model: Patient, as: 'oral_screening_patients', attributes: ['id'],
                                include: [
                                    { model: User, as: 'usersData', attributes: ['full_name', 'profile_image', 'email'] }

                                ]
                            }
                        ]
                    },
                ]
            };
            if (data.status) {
                query.where.push({ status: data.status })
            }

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(OralScreeningReports, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    addOralScreeningNotes: async (data) => {
        try {

            let obj = {
                notes: data.notes,
                updatedBy: data.userId,
            }
            const addNotes = await commonServices.update(OralScreeningMedias, { where: { id: data.id } }, obj)
            return addNotes
        } catch (error) {
            throw error
        }
    },
    addMedicines: async (data) => {
        try {
            const slug = await commonServices.generateSlug(data.name)
            let obj = {
                name: data.name,
                speciality_id: data.speciality_id,
                diseases_id: data.diseases_id,
                dosage: data.dosage,
                department: data.department,
                frequency: data.frequency,
                slug: slug,
                createdBy: data.adminId
            }
            await commonServices.create(Medicines, obj)
            return true
        } catch (error) {
            throw error
        }
    },
    updateMedicines: async (data) => {
        try {
            const obj = {
                name: data.name,
                speciality_id: data.speciality_id,
                diseases_id: data.diseases_id,
                dosage: data.dosage,
                department: data.department,
                frequency: data.frequency,
                updatedBy: data.adminId,
            }
            let updateData = await commonServices.update(Medicines, { where: { id: data.id } }, obj);

            return updateData
        } catch (error) {
            throw error
        }
    },
    viewMedicineById: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'slug', 'name', 'speciality_id', 'diseases_id', 'dosage', 'department', 'frequency'],
                include: [
                    { model: Specialities, as: 'medicineSpecialities', attributes: ['id', 'name'] },
                    { model: Diseases, as: 'medicineDiseases', attributes: ['id', 'name'] },
                ]
            };

            let responseData = await commonServices.get(Medicines, query)
            return responseData

        } catch (error) {
            throw error
        }
    },
    getAllMedicines: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { name: { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj],
                attributes: ['id', 'slug', 'name', 'speciality_id', 'diseases_id', 'dosage', 'department', 'frequency'],
                include: [
                    { model: Specialities, as: 'medicineSpecialities', attributes: ['id', 'name'] },
                    { model: Diseases, as: 'medicineDiseases', attributes: ['id', 'name'] },
                ]
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(Medicines, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    addInsuranceCompany: async (data) => {
        try {
            let obj = {
                company_name: data.company_name,
                phone_no: data.phone_no,
                image_url: data.image_url,
                address: data.address,
                createdBy: data.adminId
            }
            await commonServices.create(InsuranceCompanies, obj)
            return true
        } catch (error) {
            throw error
        }
    },
    updateInsuranceCompanyById: async (data) => {
        try {
            const obj = {
                company_name: data.company_name,
                phone_no: data.phone_no,
                image_url: data.image_url,
                address: data.address,
                updatedBy: data.adminId,
            }
            let updateData = await commonServices.update(InsuranceCompanies, { where: { id: data.id } }, obj);

            return updateData
        } catch (error) {
            throw error
        }
    },
    viewInsuranceCompanyById: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'company_name', 'phone_no', 'image_url', 'address'],
            };

            let responseData = await commonServices.get(InsuranceCompanies, query)
            return responseData

        } catch (error) {
            throw error
        }
    },
    viewAllInsuranceCompany: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { company_name: { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            let query = {
                where: [DataObj],
                attributes: ['id', 'company_name', 'phone_no', 'image_url', 'address'],
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(InsuranceCompanies, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))
            return responseData

        } catch (error) {
            throw error
        }
    },
    addLabTest: async (data) => {
        try {
            const t = await db.sequelize.transaction();
            try {
                let obj = {
                    name: data.name,
                    category: data.category,
                    sub_category: data.sub_category,
                    createdBy: data.adminId
                }
                const labTest = await commonServices.create(LabTests, obj, { transaction: t })
                if (!labTest) {
                    await t.rollback();
                    return false
                }

                const valueObj = data.lab_test_parameter.map(item => {
                    return {
                        lab_test_id: labTest.id,
                        test_parameter_name: item.test_parameter_name,
                        male_range: item.male_range,
                        female_range: item.female_range,
                        unit: item.unit,
                        createdBy: data.adminId,
                    }
                })
                const addTestParameter = await commonServices.bulkCreate(LabTestsValues, valueObj, { transaction: t })
                if (!addTestParameter) {
                    await t.rollback();
                    return false
                }

                t.commit()
                return labTest

            } catch (error) {
                console.log(error);
                await t.rollback();
                return error
            }
        } catch (error) {
            throw error
        }
    },
    updateLabTest: async (data) => {
        try {
            const t = await db.sequelize.transaction();
            try {
                const obj = {
                    name: data.name,
                    category: data.category,
                    sub_category: data.sub_category,
                    updatedBy: data.adminId,
                }
                let updateLabTestData = await commonServices.update(LabTests, { where: { id: data.id } }, obj, { transaction: t });
                if (!updateLabTestData) {
                    await t.rollback();
                    return false
                }

                if (data.lab_test_parameter) {

                    //delete data
                    var deleteTestParameterData = data.lab_test_parameter.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
                    const deleteTestParameterId = deleteTestParameterData.map(item => {
                        return item.id
                    })
                    await commonServices.delete(LabTestsValues, { where: { id: deleteTestParameterId } });

                    // update data
                    var updateTestParameterData = data.lab_test_parameter.filter(function (o) { return o.hasOwnProperty("is_edit"); })
                    const updateTestParameterIdArr = updateTestParameterData.map(item => {
                        return item.id
                    })
                    for (let j = 0; j < updateTestParameterIdArr.length; j++) {
                        const testParameterObj = {
                            test_parameter_name: updateTestParameterData[j].test_parameter_name,
                            male_range: updateTestParameterData[j].male_range,
                            female_range: updateTestParameterData[j].female_range,
                            unit: updateTestParameterData[j].unit,
                            updatedBy: data.adminId || data.userId
                        }
                        const updateData = await commonServices.update(LabTestsValues, { where: { id: updateTestParameterIdArr[j] } }, testParameterObj, { transaction: t })
                    }


                    //create data
                    const newTestParameterArr = []
                    for (let k = 0; k < data.lab_test_parameter.length; k++) {
                        if (data.lab_test_parameter[k].hasOwnProperty('id') === false) {
                            const obj = {
                                lab_test_id: data.id,
                                test_parameter_name: data.lab_test_parameter[k].test_parameter_name,
                                male_range: data.lab_test_parameter[k].male_range,
                                female_range: data.lab_test_parameter[k].female_range,
                                unit: data.lab_test_parameter[k].unit,
                                createdBy: data.adminId || data.userId
                            }
                            newTestParameterArr.push(obj)
                        }
                    }
                    const createData = await commonServices.bulkCreate(LabTestsValues, newTestParameterArr, { transaction: t })
                }

                await t.commit()
                return true
            } catch (error) {
                await t.rollback();
                return error
            }
        } catch (error) {
            throw error
        }
    },
    viewLabTestById: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'name', 'category', 'sub_category'],
                include: [
                    { model: LabTestsValues, as: 'lab_test_values', attributes: ['id', 'test_parameter_name', 'male_range', 'female_range', 'unit'], }
                ]
            };

            let responseData = await commonServices.get(LabTests, query)
            responseData.name = JSON.parse(responseData.name)
            return responseData

        } catch (error) {
            throw error
        }
    },
    getAllLabTest: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { name: { [Op.like]: `%${data.s}%` } },
                        { category: { [Op.like]: `%${data.s}%` } },
                        { sub_category: { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }
            let query = {
                where: [DataObj],
                attributes: ['id', 'name', 'category', 'sub_category'],
                include: [
                    { model: LabTestsValues, as: 'lab_test_values', attributes: ['id', 'test_parameter_name', 'male_range', 'female_range', 'unit'], }
                ]
            };

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(LabTests, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))

            responseData.data.map(item => {
                item.name = JSON.parse(item.name)
            })
            return responseData

        } catch (error) {
            throw error
        }
    },
    addClinicTests: async (data) => {
        try {

            let obj = {
                clinic_id: data.clinicId,
                lab_test_id: data.lab_test_id,
                price: data.price,
                createdBy: data.userId
            }
            const addClinicTests = await commonServices.create(LabTestClinics, obj)
            return addClinicTests
        } catch (error) {
            throw error
        }
    },
    updateClinicTests: async (data) => {
        try {

            let obj = {
                lab_test_id: data.lab_test_id,
                price: data.price,
                updatedBy: data.userId
            }
            const addClinicTests = await commonServices.update(LabTestClinics, { where: { id: data.id } }, obj)
            return addClinicTests
        } catch (error) {
            throw error
        }
    },
    viewClinicLabTestById: async (data) => {
        try {

            let query = {
                where: [{ id: data.id }],
                attributes: ['id', 'price'],
                include: [
                    { model: LabTests, as: 'lab_tests', attributes: ['name', 'category', 'sub_category'], }
                ]
            };

            let responseData = await commonServices.get(LabTestClinics, query)
            responseData.lab_tests.name = JSON.parse(responseData.lab_tests.name)
            return responseData

        } catch (error) {
            throw error
        }
    },
    getClinicAllLabTest: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { "$name.lab_tests$": { [Op.like]: `%${data.s}%` } },
                        { "$name.category$": { [Op.like]: `%${data.s}%` } },
                        { "$name.sub_category$": { [Op.like]: `%${data.s}%` } }
                    ]
                }
            }

            let query = {
                where: [DataObj],
                attributes: ['id', 'price'],
                include: [
                    { model: LabTests, as: 'lab_tests', attributes: ['name', 'category', 'sub_category'], }
                ]
            };

            if (data.clinicId) {
                query.where.push({ clinic_id: data.clinicId })
            }

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(LabTestClinics, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))

            // console.log(responseData.data[0].lab_tests);
            // responseData.data.map(item => {
            //     if (item.lab_tests.name != null) {
            //         item.lab_tests.name = JSON.parse(item.lab_tests.name)
            //     }
            // })
            return responseData

        } catch (error) {
            throw error
        }
    },
    // viewAllLabTestRequest: async (data) => {
    //     try {

    //         let DataObj = {};
    //         if (data.s) {
    //             DataObj = {
    //                 ...DataObj,
    //                 [Op.or]: [
    //                     { "$patientLabtest.name$": { [Op.like]: `%${data.s}%` } },
    //                     { "$labtestDoctorData.users.full_name$": { [Op.like]: `%${data.s}%` } },
    //                     { "$labtestPatientData.usersData.full_name$": { [Op.like]: `%${data.s}%` } },
    //                 ]
    //             }
    //         }

    //         let query = {
    //             where: [DataObj],
    //             attributes: ['id', 'appointment_id', 'patient_id', 'doctor_id', 'lab_test_id'],
    //             include: [
    //                 { model: LabTests, as: 'patientLabtest', attributes: ['id', 'name', 'category', 'sub_category'], },
    //                 {
    //                     model: Doctors, as: 'labtestDoctorData', attributes: ['id'],
    //                     include: [
    //                         {
    //                             model: User, as: 'users', attributes: ['id', 'full_name', 'profile_image'],
    //                             include: [
    //                                 { model: UserDetails, as: 'user_details', attributes: ['age', 'gender'], }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 {
    //                     model: Patient, as: 'labtestPatientData', attributes: ['id'],
    //                     include: [
    //                         {
    //                             model: User, as: 'usersData', attributes: ['id', 'full_name', 'profile_image'],
    //                             include: [
    //                                 { model: UserDetails, as: 'user_details', attributes: ['age', 'gender'], }
    //                             ]
    //                         }
    //                     ]
    //                 },
    //                 { model: LabTestClinics, as: 'labtestClinics', where: { clinic_id: data.clinicId }, attributes: ['price'] }
    //             ]
    //         };

    //         if (data.status) {
    //             if (data.status.length != 0) {
    //                 query.where.push({ status: data.status })
    //             }
    //         }

    //         const { limit, offset } = commonServices.getPagination(data.page, data.size);
    //         let getAllData = await commonServices.getAndCountAll(LabTestPatients, query, limit, offset)
    //         const response = commonServices.getPagingData(getAllData, data.page, limit);
    //         let responseData = JSON.parse(JSON.stringify(response))

    //         return responseData

    //     } catch (error) {
    //         throw error
    //     }
    // },
    viewAllLabTestRequest: async (data) => {
        try {

            let DataObj = {};
            if (data.s) {
                DataObj = {
                    ...DataObj,
                    [Op.or]: [
                        { "$appointmentReqLabTest.name$": { [Op.like]: `%${data.s}%` } },
                        { "$patients.full_name$": { [Op.like]: `%${data.s}%` } },
                    ]
                }
            }

            const query = {
                where: [DataObj, { clinic_id: data.clinicId }, { appointment_type: 'clinic_lab_test' }],
                attributes: ['id', 'appointment_type', 'status', 'patient_id', 'clinic_id', 'doctor_id', 'lab_test_id'],
                include: [
                    {
                        model: Patient, as: "patients", attributes: [/* "user_id", */ /* "unique_id", */ "full_name", "profile_image"],
                        include: [
                            {
                                model: User, as: "usersData", attributes: ["id", "slug",/*  "profile_image" */],
                                include: [
                                    { model: UserDetails, as: "user_details", attributes: [/* "id", */ "gender", "age"], }
                                ]
                            },
                        ]
                    },
                    { model: LabTests, as: "appointmentReqLabTest", attributes: ["id", "name",/*  "unique_id", "full_name", "profile_image" */] },
                    {
                        model: Doctors, as: 'doctors', required: false, attributes: ['id', 'prefix'],
                        include: [{
                            model: User, as: "users", required: false, attributes: ["id", "full_name"]
                        }]
                    }
                ]
            }

            if (data.status) {
                if (data.status.length != 0) {
                    query.where.push({ status: data.status })
                }
            }

            const { limit, offset } = commonServices.getPagination(data.page, data.size);
            let getAllData = await commonServices.getAndCountAll(AppointmentRequests, query, limit, offset)
            const response = commonServices.getPagingData(getAllData, data.page, limit);
            let responseData = JSON.parse(JSON.stringify(response))

            return responseData

        } catch (error) {
            throw error
        }
    },

    acceptAndDeclineRequest: async (data) => {
        try {

            var modifyStatus = "";
            if (data.status == "accept") {
                modifyStatus = options.appointmentStatus.INPROCESS
            }
            if (data.status == "decline") {
                modifyStatus = options.appointmentStatus.DECLINE
            }

            try {
                const t = await db.sequelize.transaction();

                const obj = {
                    status: modifyStatus,
                    updatedBy: data.userId
                }

                const responseData = await commonServices.update(AppointmentRequests, { where: { id: data.appointmentReqId } }, obj)
                if (!responseData) {
                    await t.rollback()
                    return false
                }

                const response = await commonServices.update(Appointments, { where: { id: data.appointmentId } }, obj)
                if (!response) {
                    await t.rollback()
                    return false
                }
                return true
            } catch (error) {
                await t.rollback();
                return error
            }


        } catch (error) {
            throw error
        }
    },
}

module.exports = { methods }