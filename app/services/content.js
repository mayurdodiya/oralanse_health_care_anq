const db = require('../models');
const { methods: commonServices } = require("./common");
const options = require("../config/options");
const commonConfig = require("../config/common.config");
const emailService = require("./email");
const moment = require('moment');
const { Transaction } = require('sequelize');
const { query } = require('express');
const Sequelize = require("sequelize");
const Op = db.Sequelize.Op;

const User = db.users;
const Settings = db.settings;
const UserDetails = db.user_details;
const EnduserAssignRoles = db.enduser_assign_roles;
const City = db.cities;
const Degrees = db.degrees;
const Colleges = db.colleges;
const Otps = db.otps;
const DeviceToken = db.device_tokens;
const Language = db.languages;
const Area = db.areas;
const HospitalAdmin = db.hospital_admins;
const AppointmentRequest = db.appointment_requests;
const Patient = db.patients;
const PatientInsurance = db.patient_insurances;
const Tickets = db.tickets;
const BloodBanks = db.blood_banks;
const BloodTypes = db.blood_types;
const BloodParticipants = db.blood_participants;
const Vendors = db.vendors;
const OralDoctors = db.oral_doctors;

const Ambulance = db.ambulances;
const AmbulanceRequests = db.ambulance_requests;
const Machine = db.machines;
const Promocods = db.promocods;
const Pharmacy = db.pharmacies;
const Medicines = db.medicines;
const NoticeBoards = db.notice_boards;
const Banners = db.banners;
const Doctors = db.doctors;
const Challenges = db.challenges;
const Clinics = db.clinics;
const ClinicTimings = db.clinic_timings;
const ClinicTreatments = db.clinic_treatments;
const ClinicSpecialities = db.clinic_specialities;
const ClinicFacilities = db.clinic_facilities;
const ClinicStore = db.clinic_stores;
const ClinicDoctorRelations = db.clinic_doctor_relations;
const ScreeningReports = db.screening_reports;
const DoctorsEducations = db.doctor_educations;
const DoctorRegistrationDetails = db.doctor_registration_details;
const DoctorSpecialities = db.doctor_specialities;
const RegistrationCouncils = db.registration_councils;
const DoctorAchievement = db.doctor_achievements;
const DoctorTimings = db.doctor_timings;
const Speciality = db.specialities;
const Facility = db.facilities;
const coWorkingSpaceRequest = db.co_working_space_requests;
const CoWorkingSpaces = db.co_working_spaces
const CoWorkingSpaceMedias = db.co_working_space_medias
const Jobs = db.jobs;
const jobApplicant = db.job_applicants;
const researchPosts = db.research_posts;
const Treatment = db.treatments;
const Topic = db.topics;
const Promocode = db.promocods;
const Transactions = db.transactions;
const UserBankDetails = db.user_bank_details;
const NotificationSetting = db.notification_settings;
const AssignBeds = db.assign_beds;
const ClinicStaffs = db.clinic_staffs;
const ClinicStaffsPayouts = db.clinic_staff_payouts;
const ClinicStaffAattendances = db.clinic_staff_attendances;
const MachineLogs = db.machine_logs;
const HealthAssessmentQuiz = db.health_assessment_quizzes;
const PushNotifications = db.push_notifications;
const HealthCamp = db.health_camps;
const CampPatients = db.camp_patients;
const Sos = db.sos;
const Beds = db.beds;
const EcomProductCategories = db.ecom_product_categories;
const EcomProducts = db.ecom_products;


const methods = {
	otpExist: async (value) => {
		return commonServices.checkFlag(Otps, { where: { [Op.or]: [{ email: value }, { phone_no: value }] } })
			.then((count) => {
				if (count != 0) {
					return false;
				}
				return true;
			});
	},
	deviceTokenExist: async (user_id, device_token) => {
		return commonServices.checkFlag(DeviceToken, { where: [{ user_id: user_id }, { device_token: device_token }] })
			.then((count) => {
				if (count != 0) {
					return false;
				}
				return true;
			});
	},
	getAllLanguages: async (query) => {
		query = { ...query }
		const language = await commonServices.getAll(Language, query)
		return language
	},
	getAllTopics: async (query) => {
		query = { ...query }
		const topic = await commonServices.getAll(Topic, query)
		return topic
	},
	getAllPincodes: async (query) => {
		query = { ...query }
		const language = await commonServices.getAll(Area, query)
		return language
	},
	createUserProfile: async (data, transaction) => {
		try {
			let responseData = {}
			const userData = await commonServices.create(User, {
				role_id: data.roleId || 3,
				full_name: data.full_name,
				email: data.email.toLowerCase(),
				password: data.password,
				profile_image: data.profile_image,
				slug: data.slug,
				countryCode: data.countryCode,
				phone_no: data.phone_no,
				google_id: data.google_id || null,
				facebook_id: data.facebook_id || null,
				is_active: 1,
				google_id: data.google_id
			}, { transaction })
			if (!userData) {
				await transaction.rollback()
				return false
			}
			responseData.user = JSON.parse(JSON.stringify(userData))
			const userDetailData = await commonServices.create(UserDetails, {
				user_id: userData.id,
				address1: data.address1,
				address2: data.address2,
				pincode: data.pincode,
				gender: data.gender,
				age: data.age,
				language_id: data.language_id,
				active_profile: options.PortalType.PATIENT,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				referral_code: commonServices.generateReferralCode(12),
				referral_by: data.referral_by || null,
				createdBy: data.adminId || userData.id,
			}, { transaction })
			if (!userDetailData) {
				await transaction.rollback()
				return false
			}
			responseData.userdetails = JSON.parse(JSON.stringify(userDetailData))
			return responseData
		} catch (error) {

			await transaction.rollback()
			throw error
		}
	},
	updateUserProfile: async (data, transaction) => {
		try {
			const updateUser = await commonServices.update(User, { where: { id: data.userId, role_id: data.roleId } }, {
				full_name: data.full_name,
				email: data.email.toLowerCase(),
				countryCode: data.countryCode,
				phone_no: data.phone_no,
				profile_image: data.profile_image,
				google_id: data.google_id,
				facebook_id: data.facebook_id,
				updatedBy: data.adminId || data.userId
			}, { transaction })
			if (!updateUser) {
				await transaction.rollback()
				return false
			}
			const updateUserDetail = await commonServices.update(UserDetails, { where: { user_id: data.userId } }, {
				address1: data.address1,
				address2: data.address2,
				pincode: data.pincode,
				gender: data.gender,
				age: data.age,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				updatedBy: data.adminId || data.userId
			}, { transaction })
			if (!updateUserDetail) {
				await transaction.rollback()
				return false
			}
			return true
		} catch (error) {
			console.log(error);
			await transaction.rollback()
			throw error
		}
	},
	deleteUserProfile: async (data, transaction) => {
		try {
			const deleteUser = await commonServices.delete(User, { where: { id: data.userId, role_id: data.roleId || 3 } }, { transaction })
			if (!deleteUser) {
				await transaction.rollback()
				return false
			}
			const deleteUserDetail = await commonServices.delete(UserDetails, { where: { user_id: data.userId } }, { transaction })
			if (!deleteUserDetail) {
				await t.rollback()
				return false
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	createPatientProfile: async (data, transaction) => {
		try {
			const generateUniqueId = commonServices.generateUniqueId(5)
			const patientUniqueId = commonServices.generatePatientId(generateUniqueId, data.full_name)
			const patientData = await commonServices.create(Patient, {
				user_id: data.userId,
				full_name: data.full_name,
				email: data.email.toLowerCase(),
				countryCode: data.countryCode,
				phone_no: data.phone_no,
				address1: data.address1,
				address2: data.address2,
				pincode: data.pincode,
				gender: data.gender,
				age: data.age,
				profile_image: data.profile_image,
				unique_id: patientUniqueId,
				relationship: data.relationship || options.RelationType.SELF,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!patientData) {
				await transaction.rollback()
				return false
			}
			const responseData = JSON.parse(JSON.stringify(patientData))
			return responseData
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	updatePatientProfile: async (data, transaction) => {
		try {
			await commonServices.update(Patient, { where: { unique_id: data.unique_id } }, {
				full_name: data.full_name,
				email: data.email.toLowerCase(),
				countryCode: data.countryCode,
				phone_no: data.phone_no,
				address1: data.address1,
				address2: data.address2,
				pincode: data.pincode,
				gender: data.gender,
				age: data.age,
				profile_image: data.profile_image,
				relationship: data.relationship,
				has_insurance: data.has_insurance || false,
				updatedBy: data.adminId || data.userId,
			}, { transaction })
			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	deletePatientProfile: async (data, transaction) => {
		try {
			const deletePatient = await commonServices.delete(Patient, { where: { user_id: data.userId } }, { transaction })
			if (!deletePatient) {
				await t.rollback()
				return false
			}
			const patientData = await commonServices.get(PatientInsurance, { where: { patient_id: data.patientId } })
			if (patientData != null) {
				const deletePatientInsurance = await commonServices.delete(PatientInsurance, { where: { patient_id: data.patientId } }, { transaction })
				if (!deletePatientInsurance) {
					await t.rollback()
					return false
				}
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	viewUserProfile: async (data) => {
		const newQuery = {
			where: { id: data.userId },
			attributes: ["id", "role_id", "full_name", "email", "slug", "countryCode", "phone_no", "profile_image", "is_active",],
			include: [
				{
					model: UserDetails, as: "user_details", attributes: ["address1", "address2", "gender", "age", "pincode", "location", "latitude", "longitude"],
					include: [{ model: Area, as: "areas", required: false, attributes: ["name"], include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }] }]
				},
				{
					model: Patient, as: "patients", required: false, attributes: ["id", "unique_id", "gender", "age", "relationship", "has_insurance"], where: { relationship: options.RelationType.SELF },
					include: [{ model: PatientInsurance, as: "patient_insurance", required: false, attributes: ["company_name", "policy_number", "policy_name", "insurance_type", "max_amount", "policy_doc"] }]
				}
			]
		}
		const userData = await commonServices.get(User, newQuery)
		return userData;
	},
	viewDoctorProfile: async (data) => {
		const newQuery = {
			where: { id: data.userId },
			attributes: ["id", "role_id", "full_name", "email", "slug", "countryCode", "phone_no", "profile_image", "is_active",],
			include: [
				{
					model: UserDetails, as: "user_details", attributes: ["address1", "address2", "gender", "age", "pincode", "location", "latitude", "longitude"],
					include: [{ model: Area, as: "areas", required: false, attributes: ["name"], include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }] }]
				},
				{
					model: Doctors, as: "doctors", required: false, attributes: ["id", "status", "prefix", "doctor_type", "experience", "createdAt", "document_type", "front_side_document", "back_side_document", "consultation_fees"],
					include: [
						{ model: DoctorAchievement, as: "doctorAchievement", required: false, attributes: ["id", "name", "file_path"] },
						{
							model: DoctorsEducations, as: "doctor_educations", required: false, attributes: ["id", "year", "doc_path"],
							include: [
								{ model: Degrees, as: "degrees", required: false, attributes: ["id", "name"] },
								{ model: Colleges, as: "colleges", required: false, attributes: ["id", "name"] },
							]
						},
						{
							model: DoctorRegistrationDetails, as: "doctor_registration_details", required: false, attributes: ["id", "registration_number", "registration_year", "document_path"],
							include: [
								{ model: RegistrationCouncils, as: "registration_councils", attributes: ["id", "name"] }
							]
						},
						{
							model: DoctorSpecialities, as: "doctor_specialities", required: false, attributes: ["id", "doctor_id"],
							include: [
								{ model: Speciality, as: "specialities", required: false, attributes: ["id", "name", "image_path"] },
							]
						},
						{ model: DoctorTimings, as: "doctor_timing", required: false, attributes: ["id", "day_of_week", "session_start_time", "session_end_time", "in_clinic_appointment", "consultation"] },
						{
							model: ClinicDoctorRelations, as: "clinic_doctor_relations", required: false, attributes: ["id", "doctor_id"],
							include: [
								{
									model: Clinics, as: "clinics", required: false, attributes: ['id', 'status', 'clinic_name', 'clinic_type', 'clinic_phone_number', 'address', 'consultation_fees', 'document_type', 'document_path', 'equipments', 'service_24X7', 'has_ambulance', 'ambulance_type'],
									include: [
										{
											model: Area, as: "areas", required: false, required: false, attributes: ["id", "name", "pincode"],
											include: [
												{ model: City, as: "cities", required: false, required: false, attributes: ["id", "city_name", "state_name", "country_name"] },
											]
										},
										{ model: ClinicTimings, as: "clinic_timings", required: false, attributes: ["id", "day_of_week", "session_start_time", "session_end_time", "in_clinic_appointment", "online_appointment"] },
										{
											model: ClinicSpecialities, as: "clinic_specialities", required: false, attributes: ["id"],
											include: [
												{ model: Speciality, as: "specialities", required: false, attributes: ["id", "name"] },
											]
										},
										{
											model: ClinicFacilities, as: "clinic_facilities", required: false, attributes: ["id",],
											include: [
												{ model: Facility, as: "facilities", required: false, attributes: ["id", "name"] },
											]
										},
										{
											model: ClinicTreatments, as: "clinic_treatments", required: false, attributes: ["id"],
											include: [
												{ model: Treatment, as: "treatments", required: false, attributes: ["id", "name"] },
											]
										},
									]
								},
							]
						}

					]
				}
			]
		}
		const userData = await commonServices.get(User, newQuery)

		userData.doctors.clinic_doctor_relations.map(item => {
			item.clinics.equipments = JSON.parse(item.clinics.equipments)
		})
		return userData;
	},
	viewHospitalProfile: async (data) => {
		const newQuery = {
			where: { id: data.userId },
			attributes: ["id", "role_id", "full_name", "email", "slug", "countryCode", "phone_no", "profile_image", "is_active",],
			include: [
				{
					model: UserDetails, as: "user_details", attributes: ["address1", "address2", "gender", "age", "pincode", "location", "latitude", "longitude"],
					include: [{ model: Area, as: "areas", required: false, attributes: ["name"], include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }] }]
				},
				{
					model: Doctors, as: "doctors", required: false, attributes: ["id", "status", "doctor_type", "experience", "createdAt", "document_type", "front_side_document", "back_side_document"],
					include: [
						{ model: DoctorAchievement, as: "doctorAchievement", required: false, attributes: ["id", "name", "file_path"] },
						{
							model: DoctorsEducations, as: "doctor_educations", required: false, attributes: ["id", "year"],
							include: [
								{ model: Degrees, as: "degrees", required: false, attributes: ["id", "name"] },
								{ model: Colleges, as: "colleges", required: false, attributes: ["id", "name"] },
							]
						},
						{
							model: DoctorRegistrationDetails, as: "doctor_registration_details", required: false, attributes: ["id", "registration_number", "registration_council_id", "registration_year", "document_path"],
							include: [
								{ model: RegistrationCouncils, as: "registration_councils", required: false, attributes: ["id", "name"] }
							]
						},
						{
							model: DoctorSpecialities, as: "doctor_specialities", required: false, attributes: ["id", "doctor_id"],
							include: [
								{ model: Speciality, as: "specialities", required: false, attributes: ["id", "name", "image_path"] },
							]
						},
						{ model: DoctorTimings, as: "doctor_timing", required: false, attributes: ["id", "day_of_week", "session_start_time", "session_end_time", "in_clinic_appointment", "consultation"] },
					]
				},
				{
					model: Clinics, as: "clinics", required: false, attributes: ['id', 'status', 'clinic_name', 'clinic_image', 'clinic_type', 'clinic_phone_number', 'address', 'consultation_fees', 'document_type', 'document_path', 'equipments', 'ambulance_type', 'has_ambulance', 'bio', 'service_24X7', 'home_visit', 'has_NABH', 'NABH_certificate_path', 'has_iso', 'iso_certificate_path', 'has_lab', 'has_pharmacy'],
					include: [
						{
							model: Area, as: "areas", required: false, required: false, attributes: ["id", "name", "pincode"],
							include: [
								{ model: City, as: "cities", required: false, required: false, attributes: ["id", "city_name", "state_name", "country_name"] },
							]
						},
						{ model: ClinicTimings, as: "clinic_timings", required: false, attributes: ["id", "session_start_time", "session_end_time", "day_of_week", "in_clinic_appointment", "online_appointment"] },
						{
							model: ClinicSpecialities, as: "clinic_specialities", required: false, attributes: ["id"],
							include: [
								{ model: Speciality, as: "specialities", required: false, attributes: ["id", "name"] },
							]
						},
						{
							model: ClinicFacilities, as: "clinic_facilities", required: false, attributes: ["id",],
							include: [
								{ model: Facility, as: "facilities", required: false, attributes: ["id", "name"] },
							]
						},
						{
							model: ClinicTreatments, as: "clinic_treatments", required: false, attributes: ["id", "sub_treatment_name", "treatment_fees", "description", "brand_name"],
							include: [
								{ model: Treatment, as: "treatments", required: false, attributes: ["id", "name"] },
							]
						},
					],
				}
			]
		}
		const userData = await commonServices.get(User, newQuery)
		return userData;
	},
	createOrUpdateUserInsurance: async (data, transaction) => {
		try {
			const hasInsurance = data.has_insurance || false
			if (hasInsurance == true) {
				const existInsurance = await commonServices.get(PatientInsurance, { where: { patient_id: data.patientId } })
				if (existInsurance != null) {
					await commonServices.update(PatientInsurance, { where: { id: existInsurance.id } }, {
						company_name: data.company_name,
						policy_number: data.policy_number,
						policy_name: data.policy_name,
						insurance_type: data.insurance_type,
						policy_doc: data.policy_doc || null,
						max_amount: data.max_amount,
						updatedBy: data.adminId || data.userId
					}, { transaction })
				} else {
					await commonServices.create(PatientInsurance, {
						patient_id: data.patientId,
						company_name: data.company_name,
						policy_number: data.policy_number,
						policy_name: data.policy_name,
						insurance_type: data.insurance_type,
						policy_doc: data.policy_doc || null,
						max_amount: data.max_amount,
						createdBy: data.adminId || data.userId
					}, { transaction })
				}
			} else if (hasInsurance == false) {
				await commonServices.delete(PatientInsurance, { where: { patient_id: data.patientId } }, { transaction })
			} else {
				await transaction.rollback()
				return false
			}
			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	updateAdminProfile: async (data, transaction) => {
		try {
			const updateUser = await commonServices.update(User, { where: { id: data.userId, role_id: data.roleId } }, {
				full_name: data.full_name,
				email: data.email.toLowerCase(),
				countryCode: data.countryCode,
				phone_no: data.phone_no,
				profile_image: data.profile_image,
				google_id: data.google_id,
				facebook_id: data.facebook_id,
				updatedBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!updateUser) {
				await transaction.rollback()
				return false
			}
			const updateUserDetail = await commonServices.update(UserDetails, { where: { user_id: data.userId } }, {
				address1: data.address1,
				address2: data.address2,
				pincode: data.pincode,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				updatedBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!updateUserDetail) {
				await transaction.rollback()
				return false
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	addDoctor: async (data, transaction) => {
		try {
			const addUserSubRole = await commonServices.create(EnduserAssignRoles, {
				user_id: data.userId,
				user_subrole_id: data.doctorRoleId,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addUserSubRole) {
				await t.rollback()
				return false
			}

			const addDoctor = await commonServices.create(Doctors, {
				user_id: addUserSubRole.user_id,
				doctor_type: data.doctor_type,
				prefix: data.prefix,
				experience: data.experience,
				known_language: data.known_language,
				status: options.DoctorStatus.PENDING,
				consultation_fees: data.consultation_fees,
				document_type: data.document_type,
				front_side_document: data.front_side_document,
				back_side_document: data.back_side_document,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addDoctor) {
				await t.rollback()
				return false
			}

			const educationDetailArray = data.education_detail.map(i => {
				return {
					doctor_id: addDoctor.id,
					degree_id: i.degree_id,
					college_id: i.college_id,
					year: i.year,
					doc_path: i.doc_path,
					createdBy: data.adminId || data.userId
				}
			})
			const addDoctorEducations = await commonServices.bulkCreate(DoctorsEducations, educationDetailArray, { transaction })
			if (!addDoctorEducations) {
				await t.rollback()
				return false
			}

			const addDoctorRegistrationDetails = await commonServices.create(DoctorRegistrationDetails, {
				doctor_id: addDoctor.id,
				registration_number: data.registration_number,
				registration_council_id: data.registration_council_id,
				registration_year: data.registration_year,
				document_path: data.document_path,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addDoctorRegistrationDetails) {
				await t.rollback()
				return false
			}

			if (data.doctor_achievements) {
				const achievementData = data.doctor_achievements.map(item => {
					return {
						doctor_id: addDoctor.id,
						name: item.name,
						file_path: item.file_path,
						createdBy: data.adminId || data.userId
					}
				})
				const doctorAchievement = await commonServices.bulkCreate(DoctorAchievement, achievementData, { transaction })
				if (!doctorAchievement) {
					await t.rollback()
					return false
				}
			}

			if (data.doctor_specialities) {
				const specialityArray = data.doctor_specialities.map(item => {
					return {
						doctor_id: addDoctor.id,
						speciality_id: item,
						createdBy: data.adminId || data.userId
					}
				})
				const addDoctorSpecialities = await commonServices.bulkCreate(DoctorSpecialities, specialityArray, { transaction })
				if (!addDoctorSpecialities) {
					await t.rollback()
					return false
				}
			}

			if (data.doctor_timing) {
				const doctorTimes = data.doctor_timing.map((time) => {
					return {
						doctor_id: addDoctor.id,
						day_of_week: time.day_of_week,
						session_start_time: time.session_start_time,
						session_end_time: time.session_end_time,
						in_clinic_appointment: time.in_clinic_appointment,
						consultation: time.consultation,
						createdBy: data.adminId || data.userId,
					};
				});
				const doctorTiming = await commonServices.bulkCreate(DoctorTimings, doctorTimes, { transaction })
				if (!doctorTiming) {
					await t.rollback()
					return false
				}
			}

			return { doctor: addDoctor }
		} catch (error) {
			console.log(error)
			await transaction.rollback()
			throw error
		}
	},
	updateDoctorProfile: async (data, transaction) => {
		try {
			const updateDoctor = await commonServices.update(Doctors, { where: { user_id: data.userId } }, {
				doctor_type: data.doctor_type,
				prefix: data.prefix,
				experience: data.experience,
				known_language: data.known_language,
				status: data.status,
				consultation_fees: data.consultation_fees,
				document_type: data.document_type,
				front_side_document: data.front_side_document,
				back_side_document: data.back_side_document,
				updatedBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!updateDoctor) {
				await t.rollback()
				return false
			}

			if (data.doctor_educations) {

				//delete data
				var deleteEducationtData = data.doctor_educations.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteEducationId = deleteEducationtData.map(item => {
					return item.id
				})
				await commonServices.delete(DoctorsEducations, { where: { id: deleteEducationId } });

				// update data
				var updateEducationData = data.doctor_educations.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				const updateEducationIdArr = updateEducationData.map(item => {
					return item.id
				})
				for (let j = 0; j < updateEducationData.length; j++) {
					const educationData = {
						degree_id: updateEducationData[j].degree_id,
						college_id: updateEducationData[j].college_id,
						year: updateEducationData[j].year,
						doc_path: updateEducationData[j].doc_path,
						updatedBy: data.adminId || data.userId
					}
					await commonServices.update(DoctorsEducations, { where: { id: updateEducationIdArr[j] } }, educationData, { transaction })
				}


				//create data
				const newEducationArr = []
				for (let k = 0; k < data.doctor_educations.length; k++) {
					if (data.doctor_educations[k].hasOwnProperty('id') === false) {
						const obj = {
							doctor_id: data.doctorId,
							degree_id: data.doctor_educations[k].degree_id,
							college_id: data.doctor_educations[k].college_id,
							year: data.doctor_educations[k].year,
							doc_path: data.doctor_educations[k].doc_path,
							createdBy: data.adminId || data.userId
						}
						newEducationArr.push(obj)
					}
				}
				await commonServices.bulkCreate(DoctorsEducations, newEducationArr, { transaction })
			}

			const updateDoctorRegistrationDetails = await commonServices.update(DoctorRegistrationDetails, { where: { doctor_id: data.doctorId } }, {
				registration_number: data.registration_number,
				registration_council_id: data.registration_council_id,
				registration_year: data.registration_year,
				// document_path: data.document_path,
				updatedBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!updateDoctorRegistrationDetails) {
				await t.rollback()
				return false
			}

			if (data.doctor_specialities) {

				//delete data
				var deleteSpecialityData = data.doctor_specialities.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteSpecialityId = deleteSpecialityData.map(item => {
					return item.id
				})
				await commonServices.delete(DoctorSpecialities, { where: { id: deleteSpecialityId } });

				// update data
				// var updateSpecialityData = data.doctor_specialities.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				// const updateSpecialityIdArr = updateSpecialityData.map(item => {
				// 	return item.id
				// })
				// for (let j = 0; j < updateSpecialityData.length; j++) {
				// 	const SpecialityData = {
				// 		speciality_id: updateSpecialityData[j].speciality_id,
				// 		updatedBy: data.adminId || data.userId
				// 	}
				// 	await commonServices.update(DoctorSpecialities, { where: { id: updateSpecialityIdArr[j] } }, SpecialityData, { transaction })
				// }


				//create data
				const newSpecialityArr = []
				for (let k = 0; k < data.doctor_specialities.length; k++) {
					if (data.doctor_specialities[k].hasOwnProperty('id') === false) {
						const obj = {
							doctor_id: data.doctorId,
							speciality_id: data.doctor_specialities[k].speciality_id,
							createdBy: data.adminId || data.userId
						}
						newSpecialityArr.push(obj)
					}
				}
				await commonServices.bulkCreate(DoctorSpecialities, newSpecialityArr, { transaction })
			}

			if (data.doctor_achievements) {

				//delete data
				var deleteAchievementData = data.doctor_achievements.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteAchievementId = deleteAchievementData.map(item => {
					return item.id
				})
				await commonServices.delete(DoctorAchievement, { where: { id: deleteAchievementId } });

				// update data
				var updateAchievementData = data.doctor_achievements.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				const updateAchievementIdArr = updateAchievementData.map(item => {
					return item.id
				})
				for (let j = 0; j < updateAchievementData.length; j++) {
					const achievementData = {
						name: updateAchievementData[j].name,
						file_path: updateAchievementData[j].file_path,
						updatedBy: data.adminId || data.userId
					}
					await commonServices.update(DoctorAchievement, { where: { id: updateAchievementIdArr[j] } }, achievementData, { transaction })
				}


				//create data
				const newAchievementArr = []
				for (let k = 0; k < data.doctor_achievements.length; k++) {
					if (data.doctor_achievements[k].hasOwnProperty('id') === false) {
						const obj = {
							doctor_id: data.doctorId,
							name: data.doctor_achievements[k].name,
							file_path: data.doctor_achievements[k].file_path,
							createdBy: data.adminId || data.userId
						}
						newAchievementArr.push(obj)
					}
				}
				await commonServices.bulkCreate(DoctorAchievement, newAchievementArr, { transaction })
			}

			if (data.doctor_timing) {

				//delete data
				var deleteTimingData = data.doctor_timing.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteTimingId = deleteTimingData.map(item => {
					return item.id
				})
				await commonServices.delete(DoctorTimings, { where: { id: deleteTimingId } });

				// update data
				// var updateTimingData = data.doctor_timing.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				// const updateTimingIdArr = updateTimingData.map(item => {
				// 	return item.id
				// })
				// for (let j = 0; j < updateTimingData.length; j++) {
				// 	const TimingData = {
				// 		day_of_week: updateTimingData[j].day_of_week,
				// 		session_start_time: updateTimingData[j].session_start_time,
				// 		session_end_time: updateTimingData[j].session_end_time,
				// 		in_clinic_appointment: updateTimingData[j].in_clinic_appointment,
				// 		consultation: updateTimingData[j].consultation,
				// 		updatedBy: data.adminId || data.userId
				// 	}
				// 	await commonServices.update(DoctorTimings, { where: { id: updateTimingIdArr[j] } }, TimingData, { transaction })
				// }


				//create data
				const newTimingArr = []
				for (let k = 0; k < data.doctor_timing.length; k++) {
					if (data.doctor_timing[k].hasOwnProperty('id') === false) {
						const obj = {
							doctor_id: data.doctorId,
							day_of_week: data.doctor_timing[k].day_of_week,
							session_start_time: data.doctor_timing[k].session_start_time,
							session_end_time: data.doctor_timing[k].session_end_time,
							in_clinic_appointment: data.doctor_timing[k].in_clinic_appointment,
							consultation: data.doctor_timing[k].consultation,
							createdBy: data.adminId || data.userId
						}
						newTimingArr.push(obj)
					}
				}
				await commonServices.bulkCreate(DoctorTimings, newTimingArr, { transaction })
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	deleteDoctorProfile: async (data, transaction) => {
		try {
			const deleteDoctor = await commonServices.delete(Doctors, { where: { id: data.doctorId } }, { transaction })
			if (!deleteDoctor) {
				await transaction.rollback()
				return false
			}
			const deleteDoctorsEducations = await commonServices.delete(DoctorsEducations, { where: { doctor_id: data.doctorId } }, { transaction })
			if (!deleteDoctorsEducations) {
				await transaction.rollback()
				return false
			}
			const deleteDoctorRegistrationDetails = await commonServices.delete(DoctorRegistrationDetails, { where: { doctor_id: data.doctorId } }, { transaction })
			if (!deleteDoctorRegistrationDetails) {
				await transaction.rollback()
				return false
			}
			const deleteDoctorSpecialities = await commonServices.delete(DoctorSpecialities, { where: { doctor_id: data.doctorId } }, { transaction })
			if (!deleteDoctorSpecialities) {
				await transaction.rollback()
				return false
			}
			const deleteDoctorTimings = await commonServices.delete(DoctorTimings, { where: { doctor_id: data.doctorId } }, { transaction })
			const deleteEnduserAssignRoles = await commonServices.delete(EnduserAssignRoles, { where: { user_id: data.userId, user_subrole_id: data.userRoleId } }, { transaction })
			if (!deleteEnduserAssignRoles) {
				await transaction.rollback()
				return false
			}
			const deletecoWorkingSpaceRequest = await commonServices.delete(coWorkingSpaceRequest, { where: { doctor_id: data.doctorId } }, { transaction })
			const deleteJobApplicantions = await commonServices.delete(jobApplicant, { where: { user_id: data.userId } }, { transaction })
			const deleteResearchPosts = await commonServices.delete(researchPosts, { where: { doctor_id: data.doctorId } }, { transaction })

			return true
		} catch (error) {

			await transaction.rollback()
			throw error
		}
	},
	addOralDoctor: async (data, transaction) => {
		try {
			const addUserSubRole = await commonServices.create(EnduserAssignRoles, {
				user_id: data.userId,
				user_subrole_id: data.doctorRoleId,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addUserSubRole) {
				await t.rollback()
				return false
			}

			const addDoctor = await commonServices.create(OralDoctors, {
				user_id: addUserSubRole.user_id,
				doctor_type: data.doctor_type,
				prefix: data.prefix,
				experience: data.experience,
				known_language: data.known_language,
				status: options.DoctorStatus.APPROVE,
				consultation_fees: data.consultation_fees,
				document_type: data.document_type,
				front_side_document: data.front_side_document,
				back_side_document: data.back_side_document,
				registration_number: data.registration_number,
				degree_id: data.degree_id,
				college_id: data.college_id,
				year: data.year,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addDoctor) {
				await t.rollback()
				return false
			}

			return { doctor: addDoctor }
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	updateOralDoctorProfile: async (data, transaction) => {
		try {
			const updateDoctor = await commonServices.update(OralDoctors, { where: { user_id: data.userId } }, {
				doctor_type: data.doctor_type,
				prefix: data.prefix,
				experience: data.experience,
				known_language: data.known_language,
				status: data.status,
				consultation_fees: data.consultation_fees,
				document_type: data.document_type,
				front_side_document: data.front_side_document,
				back_side_document: data.back_side_document,
				registration_number: data.registration_number,
				degree_id: data.degree_id,
				updatedBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!updateDoctor) {
				await t.rollback()
				return false
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	deleteOralDoctorProfile: async (data, transaction) => {
		try {
			const deleteDoctor = await commonServices.delete(OralDoctors, { where: { id: data.doctorId } }, { transaction })
			if (!deleteDoctor) {
				await transaction.rollback()
				return false
			}
			const deleteEnduserAssignRoles = await commonServices.delete(EnduserAssignRoles, { where: { user_id: data.userId, user_subrole_id: data.userRoleId } }, { transaction })
			if (!deleteEnduserAssignRoles) {
				await transaction.rollback()
				return false
			}
			return true
		} catch (error) {

			await transaction.rollback()
			throw error
		}
	},
	viewAllOralDoctors: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ status: { [Op.like]: `%${data.s}%` } },
						{ "$users_oral_doctor.full_name$": { [Op.like]: `%${data.s}%` } },
						{ "$users_oral_doctor.phone_no$": { [Op.like]: `%${data.s}%` } },
					]
				}
			}
			const query = {
				where: [DataObj],
				attributes: ["id", "doctor_type", "status", "prefix", "degree_id", "college_id", "consultation_fees", "year",	/* "experience", "document_type", "front_side_document", "back_side_document", */ "registration_number"],
				include: [
					{
						model: Degrees, as: "oral_doctor_degree", attributes: ["id", "name"],
					},
					{
						model: User, as: "users_oral_doctor", attributes: ["id", "slug", /* "is_active", */ "full_name", "email", "countryCode", "phone_no", "profile_image", "createdAt"],
						include: [
							{ model: UserDetails, as: "user_details", attributes: ["address1", "address2", "pincode", "gender", "age"] },
						]
					},
				]
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const getAllData = await commonServices.getAndCountAll(OralDoctors, query, limit, offset);
			let response = commonServices.getPagingData(getAllData, data.page, limit);

			return response
		} catch (error) {
			throw error
		}
	},
	addClinic: async (data, transaction) => {

		try {
			const addClinics = await commonServices.create(Clinics, {
				user_id: data.userId,
				clinic_name: data.clinic_name,
				clinic_type: data.clinic_type,
				clinic_phone_number: data.clinic_phone_number,
				address: data.address,
				pincode: data.pincode,
				bio: data.bio || null,
				clinic_image: data.clinic_image,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				status: options.ClinicStatus.PENDING,
				consultation_fees: data.clinic_consultation_fees,
				has_ambulance: data.has_ambulance,
				ambulance_type: data.ambulance_type,
				service_24X7: data.service_24X7,
				document_type: data.document_type,
				document_path: data.document_path,
				equipments: data.equipments,
				home_visit: data.home_visit,
				has_NABH: data.has_NABH,
				NABH_certificate_path: data.NABH_certificate_path,
				has_iso: data.has_iso,
				iso_certificate_path: data.iso_certificate_path,
				has_lab: data.has_lab,
				has_pharmacy: data.has_pharmacy,
				createdBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!addClinics) {
				await transaction.rollback()
				return false
			}

			if (data.clinic_timings) {
				const clinicTimingArray = data.clinic_timings.map(item => {
					return {
						clinic_id: addClinics.id,
						day_of_week: item.day_of_week,
						session_start_time: item.session_start_time,
						session_end_time: item.session_end_time,
						in_clinic_appointment: item.in_clinic_appointment || null,
						online_appointment: item.online_appointment || null,
						createdBy: data.adminId || data.userId
					}
				})
				const addClinicTimings = await commonServices.bulkCreate(ClinicTimings, clinicTimingArray, { transaction })
				if (!addClinicTimings) {
					await t.rollback()
					return false
				}
			}

			if (data.clinic_treatments) {
				const treatmentsArray = data.clinic_treatments.map(item => {
					return {
						clinic_id: addClinics.id,
						treatment_id: item.treatment_id,
						sub_treatment_name: item.sub_treatment_name,
						treatment_fees: item.treatment_fees,
						description: item.description,
						brand_name: item.brand_name,
						parent_treatment_id: item.parent_treatment_id,
						createdBy: data.adminId || data.userId
					}
				})
				const addClinicTreatments = await commonServices.bulkCreate(ClinicTreatments, treatmentsArray, { transaction })
				console.log(addClinicTreatments, "addClinicTreatments")
				if (!addClinicTreatments) {
					await t.rollback()
					return false
				}

			}

			if (data.clinic_speciality) {
				const specialityArray = data.clinic_speciality.map(item => {
					return {
						clinic_id: addClinics.id,
						speciality_id: item,
						createdBy: data.adminId || data.userId
					}
				})
				const addClinicSpecialities = await commonServices.bulkCreate(ClinicSpecialities, specialityArray, { transaction })
				if (!addClinicSpecialities) {
					await t.rollback()
					return false
				}
			}

			if (data.clinic_facility) {
				const facilityArray = data.clinic_facility.map(item => {
					return {
						clinic_id: addClinics.id,
						facility_id: item,
						createdBy: data.adminId || data.userId
					}
				})
				const addClinicFacilities = await commonServices.bulkCreate(ClinicFacilities, facilityArray, { transaction })
				if (!addClinicFacilities) {
					await t.rollback()
					return false
				}
			}
			return {
				addClinics
			}
		} catch (error) {
			console.log(error)
			await transaction.rollback()
			throw error
		}
	},
	updateClinic: async (data, transaction) => {

		try {
			const updateClinics = await commonServices.update(Clinics, { where: { id: data.clinicId } }, {
				clinic_name: data.clinic_name,
				clinic_type: data.clinic_type,
				clinic_phone_number: data.clinic_phone_number,
				address: data.address,
				pincode: data.pincode,
				bio: data.bio,
				clinic_image: data.clinic_image,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				consultation_fees: data.clinic_consultation_fees,
				has_ambulance: data.has_ambulance,
				ambulance_type: data.ambulance_type,
				service_24X7: data.service_24X7,
				document_type: data.document_type,
				document_path: data.document_path,
				equipments: data.equipments,
				home_visit: data.home_visit,
				has_NABH: data.has_NABH,
				NABH_certificate_path: data.NABH_certificate_path,
				has_iso: data.has_iso,
				iso_certificate_path: data.iso_certificate_path,
				has_lab: data.has_lab,
				has_pharmacy: data.has_pharmacy,
				updatedBy: data.adminId ? data.adminId : data.userId
			}, { transaction })
			if (!updateClinics) {
				await transaction.rollback()
				return false
			}

			if (data.clinic_timings) {

				//delete data
				var deleteTimingData = data.clinic_timings.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteTimingId = deleteTimingData.map(item => {
					return item.id
				})
				await commonServices.delete(ClinicTimings, { where: { id: deleteTimingId } });

				// update data
				// var updateTimingData = data.clinic_timings.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				// const updateTimingIdArr = updateTimingData.map(item => {
				// 	return item.id
				// })
				// for (let j = 0; j < updateTimingData.length; j++) {
				// 	const TimingData = {
				// 		day_of_week: updateTimingData[j].day_of_week,
				// 		session_start_time: updateTimingData[j].session_start_time,
				// 		session_end_time: updateTimingData[j].session_end_time,
				// 		updatedBy: data.adminId || data.userId
				// 	}
				// 	await commonServices.update(ClinicTimings, { where: { id: updateTimingIdArr[j] } }, TimingData, { transaction })
				// }


				//create data
				const newTimingArr = []
				for (let k = 0; k < data.clinic_timings.length; k++) {
					if (data.clinic_timings[k].hasOwnProperty('id') === false) {
						const obj = {
							clinic_id: data.clinicId,
							day_of_week: data.clinic_timings[k].day_of_week,
							session_start_time: data.clinic_timings[k].session_start_time,
							session_end_time: data.clinic_timings[k].session_end_time,
							in_clinic_appointment: data.clinic_timings[k].in_clinic_appointment,
							online_appointment: data.clinic_timings[k].online_appointment,
							createdBy: data.adminId || data.userId
						}
						newTimingArr.push(obj)
					}
				}
				await commonServices.bulkCreate(ClinicTimings, newTimingArr, { transaction })
			}

			if (data.clinic_treatments) {

				//delete data
				var deleteTreatmentData = data.clinic_treatments.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteTreatmentId = deleteTreatmentData.map(item => {
					return item.id
				})
				await commonServices.delete(ClinicTreatments, { where: { id: deleteTreatmentId } });

				// update data
				var updateTreatmentData = data.clinic_treatments.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				const updateTreatmentIdArr = updateTreatmentData.map(item => {
					return item.id
				})
				for (let j = 0; j < updateTreatmentData.length; j++) {
					const TreatmentData = {
						treatment_id: updateTreatmentData[j].treatment_id,
						sub_treatment_name: updateTreatmentData[j].sub_treatment_name,
						treatment_fees: updateTreatmentData[j].treatment_fees,
						description: updateTreatmentData[j].description,
						brand_name: updateTreatmentData[j].brand_name,
						parent_treatment_id: updateTreatmentData[j].parent_treatment_id,
						updatedBy: data.adminId || data.userId
					}
					await commonServices.update(ClinicTreatments, { where: { id: updateTreatmentIdArr[j] } }, TreatmentData, { transaction })
				}


				//create data
				const newTreatmentArr = []
				for (let k = 0; k < data.clinic_treatments.length; k++) {
					if (data.clinic_treatments[k].hasOwnProperty('id') === false) {
						const obj = {
							clinic_id: data.clinicId,
							treatment_id: data.clinic_treatments[k].treatment_id,
							sub_treatment_name: data.clinic_treatments[k].sub_treatment_name,
							treatment_fees: data.clinic_treatments[k].treatment_fees,
							description: data.clinic_treatments[k].description,
							brand_name: data.clinic_treatments[k].brand_name,
							parent_treatment_id: data.clinic_treatments[k].parent_treatment_id,
							createdBy: data.adminId || data.userId
						}
						newTreatmentArr.push(obj)
					}
				}
				await commonServices.bulkCreate(ClinicTreatments, newTreatmentArr, { transaction })
			}

			if (data.clinic_speciality) {

				//delete data
				var deleteSpecialitData = data.clinic_speciality.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteSpecialitId = deleteSpecialitData.map(item => {
					return item.id
				})
				await commonServices.delete(ClinicSpecialities, { where: { id: deleteSpecialitId } });

				// update data
				// var updateSpecialitData = data.clinic_speciality.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				// const updateSpecialitIdArr = updateSpecialitData.map(item => {
				// 	return item.id
				// })
				// for (let j = 0; j < updateSpecialitData.length; j++) {
				// 	const SpecialitData = {
				// 		speciality_id: updateSpecialitData[j].speciality_id,
				// 		updatedBy: data.adminId || data.userId
				// 	}
				// 	await commonServices.update(ClinicSpecialities, { where: { id: updateSpecialitIdArr[j] } }, SpecialitData, { transaction })
				// }


				//create data
				const newSpecialitArr = []
				for (let k = 0; k < data.clinic_speciality.length; k++) {
					if (data.clinic_speciality[k].hasOwnProperty('id') === false) {
						const obj = {
							clinic_id: data.clinicId,
							speciality_id: data.clinic_speciality[k].speciality_id,
							createdBy: data.adminId || data.userId
						}
						newSpecialitArr.push(obj)
					}
				}
				await commonServices.bulkCreate(ClinicSpecialities, newSpecialitArr, { transaction })
			}

			if (data.clinic_facility) {

				//delete data
				var deleteFacilityData = data.clinic_facility.filter(function (o) { return o.hasOwnProperty("is_deleted"); })
				const deleteFacilityId = deleteFacilityData.map(item => {
					return item.id
				})
				await commonServices.delete(ClinicFacilities, { where: { id: deleteFacilityId } });

				// update data
				// var updateFacilityData = data.clinic_facility.filter(function (o) { return o.hasOwnProperty("is_edit"); })
				// const updateFacilityIdArr = updateFacilityData.map(item => {
				// 	return item.id
				// })
				// for (let j = 0; j < updateFacilityData.length; j++) {
				// 	const FacilityData = {
				// 		facility_id: updateFacilityData[j].facility_id,
				// 		updatedBy: data.adminId || data.userId
				// 	}
				// 	await commonServices.update(ClinicFacilities, { where: { id: updateFacilityIdArr[j] } }, FacilityData, { transaction })
				// }


				//create data
				const newFacilityArr = []
				for (let k = 0; k < data.clinic_facility.length; k++) {
					if (data.clinic_facility[k].hasOwnProperty('id') === false) {
						const obj = {
							clinic_id: data.clinicId,
							facility_id: data.clinic_facility[k].facility_id,
							createdBy: data.adminId || data.userId
						}
						newFacilityArr.push(obj)
					}
				}
				await commonServices.bulkCreate(ClinicFacilities, newFacilityArr, { transaction })
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	deleteClinic: async (data, transaction) => {
		try {

			const getHospitalAdmin = await commonServices.get(HospitalAdmin, { where: { user_id: data.userId } })
			if (getHospitalAdmin != null) {
				const deleteHospitalAdmin = await commonServices.delete(HospitalAdmin, { where: { user_id: data.userId } }, { transaction })
				if (!deleteHospitalAdmin) {
					await transaction.rollback()
					return false
				}
			}

			const deleteClinic = await commonServices.delete(Clinics, { where: { user_id: data.userId } }, { transaction })
			if (!deleteClinic) {
				await transaction.rollback()
				return false
			}

			const deleteClinicFacilities = await commonServices.delete(ClinicFacilities, { where: { clinic_id: data.clinicId } }, { transaction })
			const deleteClinicSpecialities = await commonServices.delete(ClinicSpecialities, { where: { clinic_id: data.clinicId } }, { transaction })
			const deleteClinicTimings = await commonServices.delete(ClinicTimings, { where: { clinic_id: data.clinicId } }, { transaction })
			const deleteClinicTreatments = await commonServices.delete(ClinicTreatments, { where: { clinic_id: data.clinicId } }, { transaction })
			const deleteClinicStore = await commonServices.delete(ClinicStore, { where: { clinic_id: data.clinicId } }, { transaction })
			const deleteAmbulance = await commonServices.delete(Ambulance, { where: { clinic_id: data.clinicId } }, { transaction })
			const deleteMachine = await commonServices.delete(Machine, { where: { clinic_id: data.clinicId } }, { transaction })
			const deletePharmacy = await commonServices.delete(Pharmacy, { where: { clinic_id: data.clinicId } }, { transaction })
			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}

	},
	clinicDoctorRelationUnique: (clinicId, doctorId) => {
		return ClinicDoctorRelations.count({ where: { clinic_id: clinicId, doctor_id: doctorId } }).then((count) => {
			if (count != 0) {
				return false;
			}
			return true;
		})
	},
	addClinicDoctorRelation: async (data, transaction) => {

		try {
			const addClinicDoctorRelation = await commonServices.create(ClinicDoctorRelations, {
				clinic_id: data.clinicId,
				doctor_id: data.doctorId,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addClinicDoctorRelation) {
				await t.rollback()
				return false
			}
			return true

		} catch (error) {
			console.log(error);
			await transaction.rollback()
			throw error
		}
	},
	asignUserRole: async (data, transaction) => {
		try {

			const addUserSubRole = await commonServices.create(EnduserAssignRoles, {
				user_id: data.userId,
				user_subrole_id: data.roleId,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addUserSubRole) {
				await t.rollback()
				return false
			}

			return addUserSubRole
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	addHospitalAdmin: async (data, transaction) => {

		try {
			const addHospitalAdmin = await commonServices.create(HospitalAdmin, {
				user_id: data.userId,
				proof_type: data.proof_type,
				identity_proof_doc_path: data.identity_proof_doc_path,
				is_verified: data.is_verified || 1,
				createdBy: data.adminId || data.userId
			}, { transaction })
			if (!addHospitalAdmin) {
				await t.rollback()
				return false
			}
			return true

		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	updateHospitalAdmin: async (data, transaction) => {

		try {
			const updateHospitalAdmin = await commonServices.update(HospitalAdmin, { where: { user_id: data.userId } }, {
				proof_type: data.proof_type,
				identity_proof_doc_path: data.identity_proof_doc_path,
				// is_verified: data.is_varified || 1,
				updatedBy: data.adminId || data.userId
			}, { transaction })
			if (!updateHospitalAdmin) {
				await t.rollback()
				return false
			}
			return true

		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	getHospitalAdminDetail: async (data) => {
		const query = {
			where: { user_id: data.userId },
			attributes: ['id', 'proof_type', 'identity_proof_doc_path']
		}
		const output = await commonServices.get(HospitalAdmin, query)
		return output;
	},
	getAllPromocodes: async (query) => {
		query = {
			...query,
			where: { is_active: true, ...query.where },
			order: [...query.order, ['createdAt', 'DESC']]
		}
		const treatment = await commonServices.getAll(Promocode, query)
		return treatment
	},
	changeSettingStatus: async (id, status) => {
		const obj = {
			is_active: status
		}
		await commonServices.update(Settings, { where: { id: id } }, obj)
		return true
	},
	changeUserStatus: async (slug, roleId, status) => {
		const obj = {
			is_active: status
		}
		await commonServices.update(User, { where: { slug: slug, role_id: roleId } }, obj)
		return true
	},
	changeTreatmentStatus: async (id, status) => {
		const obj = {
			is_active: status
		}
		await commonServices.update(Treatment, { where: { id: id } }, obj)
		return true
	},
	changeSpecialityStatus: async (id, status, transaction) => {
		try {

			const obj = {
				is_active: status
			}
			const updateStatus = await commonServices.update(Speciality, { where: { id: id } }, obj, { transaction })
			if (!updateStatus) {
				await t.rollback()
				return false
			}

			return true
		} catch (error) {

			await transaction.rollback()
			throw error
		}
	},
	changeSpecialityChildStatus: async (data, status, transaction) => {
		try {
			for (let i = 0; i < data.length; i++) {
				if (data[i].id) {
					const obj = {
						is_active: status,
					}
					const updateStatus = await commonServices.update(Speciality, { where: { id: data[i].id } }, obj, { transaction })
					if (!updateStatus) {
						await t.rollback()
						return false
					}
				}
			}
			return true
			// const obj = {
			// 	is_active: status
			// }
			// const updateStatus = await commonServices.update(Speciality, { where: { id: { [Op.or]: [7, 8] } } }, obj, { transaction });
			// if (!updateStatus) {
			// 	await t.rollback()
			// 	return false
			// }
			// return true

		} catch (error) {
			await transaction.rollback()
			throw error
		}

	},
	deleteSpeciality: async (data, transaction) => {
		try {

			const deleteParentSpeciality = await commonServices.delete(Speciality, { where: { id: data.id } }, { transaction })
			if (!deleteParentSpeciality) {
				await t.rollback()
				return false
			}

			const getSpeciality = await commonServices.getAll(Speciality, { where: { parent_specialist_id: data.id } })
			if (getSpeciality != null) {

				for (let j = 0; j < getSpeciality.length; j++) {

					const deleteSpeciality = await commonServices.delete(Speciality, { where: { id: getSpeciality[j].id } }, { transaction })
					if (!deleteSpeciality) {
						await transaction.rollback()
						return false
					}

				}
			}

			const deleteTreatment = await commonServices.delete(Treatment, { where: { speciality_id: data.id } }, { transaction })

			if (!deleteTreatment) {
				await t.rollback()
				return false
			}


			return true
		} catch (error) {

			await transaction.rollback()
			throw error
		}
	},
	deleteCity: async (data, transaction) => {
		try {

			const deleteCity = await commonServices.delete(City, { where: { id: data.id } }, { transaction })
			if (!deleteCity) {
				await t.rollback()
				return false
			}

			const getArea = await commonServices.getAll(Area, { where: { city_id: data.id } })
			if (getArea != null) {
				const deleteArea = await commonServices.delete(Area, { where: { city_id: data.id } }, { transaction })
				if (!deleteArea) {
					await transaction.rollback()
					return false
				}
			}

			return true
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	changeHospitalAdminStatus: async (userId, status) => {
		const obj = {
			is_verified: status
		}
		await commonServices.update(HospitalAdmin, { where: { user_id: userId } }, obj)
		return true
	},
	changePromocodsStatus: async (id, status) => {
		const obj = {
			is_active: status
		}
		await commonServices.update(Promocods, { where: { id: id } }, obj)
		return true
	},
	changeProductCategoryStatus: async (id, status) => {
		try {
			const t = await db.sequelize.transaction();
			const obj = {
				is_active: status
			}
			await commonServices.update(EcomProductCategories, { where: { id: id } }, obj, { transaction: t })
			await commonServices.update(EcomProducts, { where: { category_id: id } }, obj, { transaction: t })

			await t.commit();
			return true

		} catch (error) {
			await t.rollback();
			return error
		}
	},
	changeProductStatus: async (id, status) => {
		try {
			const t = await db.sequelize.transaction();
			const obj = {
				is_active: status
			}
			await commonServices.update(EcomProducts, { where: { id: id } }, obj, { transaction: t })

			await t.commit();
			return true

		} catch (error) {
			await t.rollback();
			return error
		}
	},
	changePharmacyStatus: async (id, status) => {
		const obj = {
			is_active: status
		}
		await commonServices.update(Pharmacy, { where: { id: id } }, obj)
		return true
	},
	changeChallengeStatus: async (id, status) => {
		const obj = {
			is_active: status
		}
		await commonServices.update(Challenges, { where: { id: id } }, obj)
		return true
	},
	addJob: async (data) => {
		try {
			const obj = {
				clinic_id: data.clinicId,
				createdBy: data.userId,
				...data
			}
			const addJob = await commonServices.create(Jobs, obj)
			return addJob
		} catch (error) {
			return error
		}
	},
	editJob: async (data) => {
		const obj = {
			updatedBy: data.userId,
			...data
		}
		const editJob = await commonServices.update(Jobs, { where: { id: data.id } }, obj)
		return editJob
	},
	viewAllJob: async (data) => {
		let DataObj = {}
		if (data.s) {
			DataObj = {
				[Op.or]: [
					{ company_name: { [Op.like]: `%${data.s}%` } },
					{ name: { [Op.like]: `%${data.s}%` } },
					{ salary: { [Op.like]: `%${data.s}%` } },
					{ job_type: { [Op.like]: `%${data.s}%` } },
				]
			}
		}

		const query = {
			where: [DataObj, { createdBy: { [Op.ne]: data.userId } }],
			attributes: ['id', 'name', 'salary', 'salary_time', 'location', 'job_type', 'description', 'experience'],
			include: [
				{ model: Degrees, as: 'degrees', attributes: ['id', 'name'] },
				{ model: Speciality, as: 'jobsSpecialities', attributes: ['id', 'name'] },
			],
			order: [["createdAt", "DESC"]]
		}


		const { limit, offset } = commonServices.getPagination(data.page, data.size);
		const jobData = await commonServices.getAndCountAll(Jobs, query, limit, offset);
		const response = await commonServices.getPagingData(jobData, data.page, limit);
		return response;
	},
	viewAllMyJob: async (data) => {
		let DataObj = {}
		if (data.s) {
			DataObj = {
				[Op.or]: [
					{ company_name: { [Op.like]: `%${data.s}%` } },
					{ name: { [Op.like]: `%${data.s}%` } },
					{ salary: { [Op.like]: `%${data.s}%` } },
					{ job_type: { [Op.like]: `%${data.s}%` } },
				]
			}
		}

		const query = {
			where: [DataObj, { createdBy: data.userId }],
			attributes: ['id', 'name', 'salary', 'salary_time', 'location', 'job_type', 'description', 'experience', 'createdBy'],
			order: [["createdAt", "DESC"]]
		}


		const { limit, offset } = commonServices.getPagination(data.page, data.size);
		const jobData = await commonServices.getAndCountAll(Jobs, query, limit, offset);
		const response = await commonServices.getPagingData(jobData, data.page, limit);
		return response;
	},
	applyForJob: async (data) => {
		const obj = {
			job_id: data.jobId,
			user_id: data.userId,
			status: options.jobStatus.APPLIED,
			createdBy: data.userId,
			...data
		}
		const applyJob = await commonServices.create(jobApplicant, obj)
		return applyJob
	},
	jobApplicantsListing: async (data) => {
		let DataObj = {}
		if (data.s) {
			DataObj = {
				[Op.or]: [
					{ full_name: { [Op.like]: `%${data.s}%` } },
					{ phone_no: { [Op.like]: `%${data.s}%` } }
				]
			}
		}

		const query = {
			where: [DataObj, { job_id: data.id }],
			attributes: ['id', 'full_name', 'phone_no'],
			include: [
				{ model: User, as: "userData", attributes: ['profile_image'] }
			],
			order: [["createdAt", "DESC"]]
		}


		const { limit, offset } = commonServices.getPagination(data.page, data.size);
		const applicant = await commonServices.getAndCountAll(jobApplicant, query, limit, offset);
		const response = await commonServices.getPagingData(applicant, data.page, limit);
		return response;
	},
	viewApplicantsDetails: async (data) => {
		const query = {
			where: { id: data.id },
			attributes: ['id', 'full_name', 'phone_no', 'experience', 'gender', 'email', 'current_job', 'current_salary', 'current_salary_time', 'resume_path', 'skill'],
			include: [
				{
					model: User, as: "userData", attributes: ['profile_image'],
					include: [
						{ model: Doctors, as: "doctors", required: false, attributes: ['prefix', 'doctor_type', 'rating_point', 'experience'] },
					]
				},
				{ model: Jobs, as: "jobs", attributes: ['experience'] }
			],
			order: [["createdAt", "DESC"]]
		}
		const applicant = await commonServices.get(jobApplicant, query)
		return applicant;
	},
	viewJobDetail: async (data) => {
		const query = {
			where: { id: data.id },
			attributes: ['company_name', 'image_path', 'name', 'description', 'experience', 'location', 'salary', 'salary_time', 'job_type'],
			include: [
				{ model: Degrees, as: 'degrees', attributes: ['id', 'name'] },
				{ model: Speciality, as: 'jobsSpecialities', attributes: ['id', 'name'] },
			]
		}
		const jobData = await commonServices.get(Jobs, query)
		return jobData
	},
	addCoWorkingSpaces: async (data) => {
		const t = await db.sequelize.transaction();
		try {
			const obj = {
				clinic_id: data.clinicId,
				name: data.name,
				description: data.description,
				phone_no: data.phone_no,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				rent: data.rent,
				rent_period: data.rent_period,
				amenities: data.amenities,
				createdBy: data.userId,
			}
			const addCoWorkingSpaces = await commonServices.create(CoWorkingSpaces, obj, { transaction: t });
			if (!addCoWorkingSpaces) {
				await t.rollback()
				return false
			}

			const mediaArr = data.media.map(i => {
				return {
					co_working_space_id: addCoWorkingSpaces.id,
					doc_path: i.doc_path,
					createdBy: data.userId,
				}
			})
			const addMedias = await commonServices.bulkCreate(CoWorkingSpaceMedias, mediaArr, { transaction: t });
			if (!addMedias) {
				await t.rollback()
				return false
			};

			await t.commit();
			return true

		} catch (error) {

			await t.rollback()
			throw error
		}
	},
	updateCoWorkingSpaces: async (data) => {
		const t = await db.sequelize.transaction();
		try {
			const obj = {
				name: data.name,
				description: data.description,
				phone_no: data.phone_no,
				location: data.location,
				latitude: data.latitude,
				longitude: data.longitude,
				rent: data.rent,
				rent_period: data.rent_period,
				amenities: data.amenities,
				updatedBy: data.userId,
			}
			const addCoWorkingSpaces = await commonServices.update(CoWorkingSpaces, { where: { id: data.id } }, obj, { transaction: t });
			if (!addCoWorkingSpaces) {
				await t.rollback()
				return false
			}


			if (data.media) {
				for (let j = 0; j < data.media.length; j++) {
					if (data.media[j].is_edit) {
						const mediaArr = {
							doc_path: data.media[j].doc_path,
							updatedBy: data.userId
						}
						const updateMedias = await commonServices.update(CoWorkingSpaceMedias, { where: { id: data.media[j].id } }, mediaArr, { transaction: t })
						if (!updateMedias) {
							await t.rollback()
							return false
						}
					}
				}
			}

			await t.commit();
			return true

		} catch (error) {

			await t.rollback()
			throw error
		}
	},
	deleteCoWorkingSpaces: async (data) => {
		const t = await db.sequelize.transaction();
		try {

			await commonServices.delete(CoWorkingSpaces, { where: { id: data.id } }, { transaction: t });
			await commonServices.delete(CoWorkingSpaceMedias, { where: { co_working_space_id: data.id } }, { transaction: t });

			await t.commit();
			return true

		} catch (error) {

			await t.rollback()
			throw error
		}
	},
	viewAllCoWorkingSpaces: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ name: { [Op.like]: `%${data.s}%` } },
						{ rent: { [Op.like]: `%${data.s}%` } },
					]
				}
			}
			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const query = {
				where: [DataObj],
				attributes: ['id', 'name', 'location', 'rent', 'rent_period', 'createdAt'],
				include: [
					{ model: CoWorkingSpaceMedias, as: "co_working_space_medias", attributes: ['doc_path'] }
				],
				order: [["createdAt", "DESC"]],
				distinct: true
			}

			const getAllData = await commonServices.getAndCountAll(CoWorkingSpaces, query, limit, offset);
			const response = commonServices.getPagingData(getAllData, data.page, limit);

			return response
		} catch (error) {
			throw error
		}
	},
	viewAllCoWorkingSpacesRequest: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ name: { [Op.like]: `%${data.s}%` } },
						{ rent: { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			const query = {
				where: [DataObj, { co_working_space_id: data.id }],
				attributes: ['id', 'doctor_id', 'status', 'createdAt'],
				include: [
					{
						model: Doctors, as: "doctors_request", attributes: ['user_id'],
						include: [
							{ model: User, as: "users", attributes: ['full_name', 'phone_no', 'email'], }
						]
					}
				],
				order: [["createdAt", "DESC"]],
				distinct: true
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const getAllData = await commonServices.getAndCountAll(coWorkingSpaceRequest, query, limit, offset);
			const response = commonServices.getPagingData(getAllData, data.page, limit);

			return response
		} catch (error) {
			throw error
		}
	},
	viewCoWorkingSpacesRequestDetail: async (data) => {
		try {
			const query = {
				where: [{ co_working_space_id: data.id }],
				attributes: ['id', 'doctor_id', 'status'],
				include: [
					{
						model: Doctors, as: "doctors_request", attributes: ['user_id', 'doctor_type', 'consultation_fees', 'experience'],
						include: [
							{ model: User, as: "users", attributes: ['full_name', 'phone_no', 'email'], }
						]
					}
				],
			}

			const response = await commonServices.get(coWorkingSpaceRequest, query);

			return response
		} catch (error) {
			throw error
		}
	},
	viewCoWorkingSpaceDetail: async (data) => {
		const query = {
			where: { id: data.id },
			attributes: ['id', 'name', 'location', 'rent', 'rent_period', 'phone_no', 'description', 'amenities'],
			include: [
				{ model: CoWorkingSpaceMedias, as: "co_working_space_medias", attributes: ['doc_path'] }
			],
		}
		const detail = await commonServices.get(CoWorkingSpaces, query)
		return detail
	},
	viewAllTransaction: async (data) => {

		// where: { [Op.or]: [{ slot_timing: { [Op.lte]: endDate, [Op.gte]: startDate, } }], status: status },
		const { limit, offset } = commonServices.getPagination(data.page, data.size);
		let query = {
			where: [],
			attributes: ['id', 'remarks', 'amount', 'createdAt', 'payment_type', 'status'],
		};

		if (data.startDate) {
			// if (data.startDate.length > 0) {
			query.where.push({ [Op.or]: [{ createdAt: { [Op.lte]: data.endDate, [Op.gte]: data.startDate, } }] })
			// }
		}
		if (data.userId) {
			if (data.userId != null) {
				query.where.push({ user_id: data.userId })
			}
		}
		if (data.status.length > 0) {
			query.where.push({ status: data.status })
		}

		let transactionData = await commonServices.getAndCountAll(Transactions, query, limit, offset)
		const response = commonServices.getPagingData(transactionData, data.page, limit);
		let responseData = JSON.parse(JSON.stringify(response))
		return responseData
	},
	viewClinicAllTransaction: async (data) => {

		// where: { [Op.or]: [{ slot_timing: { [Op.lte]: endDate, [Op.gte]: startDate, } }], status: status },
		const { limit, offset } = commonServices.getPagination(data.page, data.size);
		let query = {
			where: [{ user_id: data.userId }, { [Op.or]: [{ createdAt: { [Op.lte]: data.endDate, [Op.gte]: data.startDate, } }] }],
			attributes: ['id', 'amount', 'createdAt', 'payment_type'],
			include: [
				{ model: User, as: "usersTransaction", attributes: ['id', 'full_name', 'profile_image'], }
			]
		};

		if (data.status.length > 0) {
			query.where.push({ status: data.status })
		}

		let transactionData = await commonServices.getAndCountAll(Transactions, query, limit, offset)
		const response = commonServices.getPagingData(transactionData, data.page, limit);
		let responseData = JSON.parse(JSON.stringify(response))
		return responseData
	},
	viewAllWithdrawRequest: async (data) => {
		try {
			// where: { [Op.or]: [{ slot_timing: { [Op.lte]: end_date, [Op.gte]: start_date, } }], status: status },
			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [{ request_type: options.requestType.WITHDRAW }],
				attributes: ['id', 'user_id', 'remarks', 'amount', 'createdAt', 'payment_type', 'order_id', 'status'],
				include: [
					{ model: UserBankDetails, as: "user_bank_details", attributes: ['bank_name', 'account_number'] },
					{
						model: User, as: "usersTransaction", attributes: ['id', 'full_name', 'email', 'profile_image', 'phone_no'],
						include: [
							{ model: UserDetails, as: "user_details", attributes: ['age', 'gender'] },
						]
					},
				],
			};
			if (data.start_date) {
				if (data.start_date.length > 0) {
					query.where.push({ createdAt: { [Op.lte]: data.end_date, [Op.gte]: data.start_date, } })
				}
			}

			if (data.status) {
				if (data.status.length > 0) {
					query.where.push({ status: data.status })
				}
			}

			if (data.userId) {
				if (data.userId.length > 0) {
					query.where.push({ user_id: data.userId })
				}
			}

			let transactionData = await commonServices.getAndCountAll(Transactions, query, limit, offset)
			const response = commonServices.getPagingData(transactionData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData
		} catch (error) {
			console.log(error);
			return error
		}

	},
	addWithdrawRequest: async (data, transaction) => {
		try {
			const transactionObj = {
				user_id: data.patientUserId || data.userId,
				order_id: commonServices.generateOrderId(14),
				payment_id: commonServices.generatePaymentId(14),
				payment_method: data.payment_method,
				payment_type: options.paymentType.DEBIT,
				request_type: options.requestType.WITHDRAW,
				txn_type: options.txnType.OTHER,
				amount: data.amount,
				status: options.paymentStatus.PENDING,
				remarks: data.remarks,
				txn_id: commonServices.generateUniqueId(12),
				createdBy: data.userId,
			}
			const addTransaction = await commonServices.create(Transactions, transactionObj, { transaction });
			if (!addTransaction) {
				await transaction.rollback()
				return false
			}

			const bankDetailObj = {
				user_id: data.patientUserId || data.userId,
				transaction_id: addTransaction.id,
				bank_name: data.bank_name,
				account_holder_name: data.account_holder_name,
				account_number: data.account_number,
				ifsc_code: data.ifsc_code,
				amount: data.amount,
				createdBy: data.userId,
			}
			const addRequest = await commonServices.create(UserBankDetails, bankDetailObj, { transaction });
			if (!addRequest) {
				await transaction.rollback()
				return false
			};

			await transaction.commit();
			return true

		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	addHospitalTicket: async (data) => {
		const obj = {
			sender_id: data.userId,
			receiver_id: data.adminId,
			subject: data.subject,
			message: data.message,
			status: options.ticketStatus.OPENED,
			createdBy: data.userId,
		}
		const userData = await commonServices.create(Tickets, obj)
		return userData
	},
	updateHospitalTicket: async (data, transaction) => {
		const obj = {
			subject: data.subject,
			message: data.message,
			updatedBy: data.userId,
		}
		const userData = await commonServices.update(Tickets, { where: { id: data.id } }, obj)
		return userData
	},
	viewAllAmbulanceRequest: async (data) => {

		const { limit, offset } = commonServices.getPagination(data.page, data.size);
		const query = {
			where: [{ status: data.status }],
			attributes: ['id', 'ambulance_id', 'address1', 'phone_no', 'createdAt'],
			include: [
				{ model: Ambulance, as: "ambulances", where: { clinic_id: data.clinicId }, attributes: ['type', 'name',] },
				{ model: User, as: "users", attributes: ['id', 'full_name',] }
			]
		}

		let ambulanceData = await commonServices.getAndCountAll(AmbulanceRequests, query, limit, offset)
		let response = commonServices.getPagingData(ambulanceData, data.page, limit);
		let responseData = JSON.parse(JSON.stringify(response))
		return responseData
	},
	assignBeds: async (data) => {
		try {
			const obj = {
				appointment_id: data.appointmentId,
				bed_id: data.bed_id,
				discharge_date: data.discharge_date,
				createdBy: data.adminId,
			}
			const addTransaction = await commonServices.create(AssignBeds, obj);
			if (addTransaction) {
				const updateBeds = await commonServices.update(Beds, { where: { id: data.bed_id, clinic_id: data.clinicId } }, { status: options.BedAllotmentStatus.OCCUPIED });
			}

			return addTransaction

		} catch (error) {
			throw error
		}
	},
	addClinicStaff: async (data) => {
		try {
			const obj = {
				user_id: data.userId,
				clinic_id: data.clinicId,
				employee_type: data.employee_type,
				salary: data.salary,
				salary_time: data.salary_time,
				bed_id: data.bed_id,
				createdBy: data.adminId,
			}
			const addClinicStaff = await commonServices.create(ClinicStaffs, obj);

			return addClinicStaff
		} catch (error) {
			throw error
		}
	},
	updateClinicStaff: async (data) => {
		try {
			const obj = {
				employee_type: data.employee_type,
				salary: data.salary,
				salary_time: data.salary_time,
				bed_id: data.bed_id,
				updatedBy: data.adminId,
			}
			const addClinicStaff = await commonServices.update(ClinicStaffs, { where: { user_id: data.userId, clinic_id: data.clinicId } }, obj);

			return addClinicStaff
		} catch (error) {
			throw error
		}
	},
	viewAllEmployee: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ employee_type: { [Op.like]: `%${data.s}%` } },
						{ "$clinicStaffUser.full_name$": { [Op.like]: `%${data.s}%` } },
						{ "$clinicStaffUser.phone_no$": { [Op.like]: `%${data.s}%` } },
						{ "$clinicStaffUser.user_details.gender$": { [Op.like]: `%${data.s}%` } }
					]
				}
			}

			const query = {
				where: [DataObj, /* { clinic_id: data.clinicId } */],
				attributes: ['id', 'salary', 'employee_type'],
				include: [
					{
						model: User, as: "clinicStaffUser", attributes: ['slug', 'profile_image', 'full_name', 'phone_no'],
						include: [
							{ model: UserDetails, as: "user_details", attributes: ['gender', 'age',], }

						]
					}
				]
			}
			if (data.clinicId) {
				query.where.push({ clinic_id: data.clinicId })
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const allEmployee = await commonServices.getAndCountAll(ClinicStaffs, query, limit, offset);
			const response = commonServices.getPagingData(allEmployee, data.page, limit);

			return response
		} catch (error) {

			throw error
		}
	},
	viewEmployeeById: async (data) => {
		try {

			const query = {
				where: [{ slug: data.slug }],
				attributes: ['slug', 'full_name', 'email', 'profile_image', 'countryCode', 'phone_no'],
				include: [
					{
						model: UserDetails, as: "user_details", attributes: ['address1', 'pincode', 'gender', 'age'],
						include: [{ model: Area, as: "areas", required: false, attributes: ["name"], include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }] }]
					},
					{
						model: ClinicStaffs, as: "clinic_staffs", attributes: ['employee_type', 'salary', 'salary_time',],
						include: [
							{ model: Beds, as: "beds", attributes: ['id', 'bed_number'] }
						]
					},
				]
			}
			const response = await commonServices.get(User, query);

			return response
		} catch (error) {

			throw error
		}
	},
	viewAllEmployeePayout: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ "$clinicStaffUser.full_name$": { [Op.like]: `%${data.s}%` } }
					]
				}
			}

			// const { Op, literal } = require('sequelize');

			// // Define the month to filter by
			// const targetMonth = 10; // October, for example

			// Table1.findAll({
			// 	include: [
			// 		{
			// 			model: Table2,
			// 			required: true,
			// 			where: {
			// 				[Op.and]: [
			// 					literal(`MONTH(Table1.date) = ${targetMonth}`),
			// 					literal('MONTH(Table1.date) = MONTH(Table2.date)'),
			// 				],
			// 			},
			// 		},
			// 	],
			// })

			const query = {
				where: [DataObj],
				attributes: ['id', 'date', 'payout', 'status'],
				include: [
					{
						model: ClinicStaffs, as: "clinic_staff_data", where: { clinic_id: data.clinicId }, attributes: ['id', 'user_id', 'salary', 'salary_time'],
						include: [
							{
								model: User, as: "clinicStaffUser", attributes: [/* 'slug', */ 'profile_image', 'full_name',],
								include: [
									{ model: UserDetails, as: "user_details", attributes: ["age", "gender"], }
								]
							},
							// {
							// 	model: ClinicStaffAattendances, as: "clinic_staff_attendances",
							// 	attributes: ['id', 'date', 'is_present',],
							// 	where: {
							// 		is_present: true,
							// 		[Op.and]: [
							// 			Sequelize.literal(`MONTH(clinic_staff_payouts.date) = ${2023 - 10 - 10}`),
							// 			Sequelize.literal('MONTH(clinic_staff_payouts.date) = MONTH(clinic_staff_attendances.date)'),
							// 		],

							// 	}
							// 	// attributes: [
							// 	// 	[Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
							// 	// 	[Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
							// 	// 	// 'clinic_staff_id',
							// 	// 	[Sequelize.literal('SUM(CASE WHEN is_present = true THEN 1 ELSE 0 END)'), 'present_count'],
							// 	// 	// [Sequelize.literal('SUM(CASE WHEN is_present = false THEN 1 ELSE 0 END)'), 'absent_count'],
							// 	// ],
							// 	// group: ['year', 'month', 'clinic_staff_id'],
							// },
						]
					},

				]
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const allEmployee = await commonServices.getAndCountAll(ClinicStaffsPayouts, query, limit, offset);
			const response = commonServices.getPagingData(allEmployee, data.page, limit);

			return response
		} catch (error) {

			throw error
		}
	},
	getMonthlyAttendanceCounts: async (data) => {
		try {

			const query = {
				where: [],
				attributes: [
					[Sequelize.fn('YEAR', Sequelize.col('date')), 'year'],
					[Sequelize.fn('MONTH', Sequelize.col('date')), 'month'],
					'clinic_staff_id',
					[Sequelize.literal('SUM(CASE WHEN is_present = true THEN 1 ELSE 0 END)'), 'present_count'],
					[Sequelize.literal('SUM(CASE WHEN is_present = false THEN 1 ELSE 0 END)'), 'absent_count'],
				],
				group: ['year', 'month', 'clinic_staff_id'],
				include: [
					{
						model: ClinicStaffs, as: "clinic_staff", where: { clinic_id: data.clinicId }, attributes: ['id'],
						include: [
							{
								model: User, as: "clinicStaffUser", attributes: ['id', 'full_name', 'profile_image'],
								include: [
									{ model: UserDetails, as: "user_details", attributes: ["age", "gender"], }
								]
							}
						]
					},
				]
			}

			if (data.month) {
				const month = moment(data.month).format('L')
				const year = data.month.split(' ')[1];
				var DataObj = {
					[Op.and]:
						[
							Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('date')), month),
							Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('date')), year)
						]
				}
				query.where.push(DataObj)
			}

			const attendanceCounts = await commonServices.getAll(ClinicStaffAattendances, query);
			return attendanceCounts;
		} catch (error) {
			throw error;
		}
	},
	addClinicTreatment: async (data) => {
		try {
			const obj = {
				clinic_id: data.clinicId,
				treatment_id: data.treatment_id,
				treatment_fees: data.treatment_fees,
				sub_treatment_name: data.sub_treatment_name,
				description: data.description,
				brand_name: data.brand_name,
				parent_treatment_id: data.parent_treatment_id,
				createdBy: data.adminId || data.userId
			}
			const addClinicTreatment = await commonServices.create(ClinicTreatments, obj)
			return addClinicTreatment

		} catch (error) {
			throw error
		}
	},
	updateClinicTreatment: async (data) => {
		try {
			const obj = {
				treatment_id: data.treatment_id,
				treatment_fees: data.treatment_fees,
				sub_treatment_name: data.sub_treatment_name,
				description: data.description,
				brand_name: data.brand_name,
				parent_treatment_id: data.parent_treatment_id,
				updatedBy: data.adminId || data.userId
			}
			const addClinicTreatment = await commonServices.update(ClinicTreatments, { where: { id: data.id } }, obj)
			return addClinicTreatment

		} catch (error) {
			throw error
		}
	},
	getAllClinicTreatments: async (data) => {
		try {

			var DataObj = {}
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ brand_name: { [Op.like]: `%${data.s}%` } },
						{ '$treatments.name$': { [Op.like]: `%${data.s}%` } },
						{ '$treatments.specialitydata.name$': { [Op.like]: `%${data.s}%` } }
					]
				}
			}

			const query = {
				where: [DataObj, { clinic_id: data.clinicId }, { parent_treatment_id: null }],
				attributes: ['id', 'treatment_fees', 'description', 'sub_treatment_name', 'brand_name'],
				include: [
					{
						model: Treatment, as: "treatments",
						attributes: ['id', 'speciality_id', 'name', 'image_path', 'description'],
						include: [
							{
								model: Speciality, as: "specialitydata",
								attributes: ['id', 'name', 'image_path'],
							},
						]
					},
					{
						model: ClinicTreatments, as: "SubTreatments",
						attributes: ['id', 'treatment_fees', 'description', 'sub_treatment_name', 'brand_name'],
						include: [
							{
								model: Treatment, as: "treatments",
								attributes: ['id', 'speciality_id', 'name', 'image_path', 'description'],
								include: [
									{
										model: Speciality, as: "specialitydata",
										attributes: ['id', 'name', 'image_path'],
									},
								]
							},
						]
					},
				]
			}

			// if (data.treatmentId) {
			// 	query.where.push({ treatment_id: data.treatmentId })
			// }


			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const getAllTreatment = await commonServices.getAndCountAll(ClinicTreatments, query, limit, offset)
			const response = commonServices.getPagingData(getAllTreatment, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData
		} catch (error) {
			throw error
		}
	},
	viewClinicTreatmentByid: async (data) => {
		try {

			const query = {
				where: [/* { clinic_id: data.clinicId }, */ { id: data.treatmentId }/* { parent_treatment_id: null } */],
				attributes: ['id', 'treatment_fees', 'description', 'sub_treatment_name', 'brand_name'],
				include: [
					{
						model: Treatment, as: "treatments", required: false,
						attributes: ['id', 'speciality_id', 'name', 'image_path', 'description'],
						include: [
							{
								model: Speciality, as: "specialitydata", required: false,
								attributes: ['id', 'name', 'image_path'],
							},
						]
					},
					{
						model: ClinicTreatments, as: "SubTreatments", required: false,
						attributes: ['id', 'treatment_fees', 'description', 'sub_treatment_name', 'brand_name'],
						include: [
							{
								model: Treatment, as: "treatments", required: false,
								attributes: ['id', 'speciality_id', 'name', 'image_path', 'description'],
								include: [
									{
										model: Speciality, as: "specialitydata", required: false,
										attributes: ['id', 'name', 'image_path'],
									},
								]
							},
						]
					},
				]
			}

			const response = await commonServices.get(ClinicTreatments, query)
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData
		} catch (error) {
			throw error
		}
	},
	getClinicAllBloodType: async (data) => {
		try {
			const query = {
				where: { clinic_id: data.clinicId },
				attributes: ['id', 'stock', 'createdAt'],
				include: [
					{
						model: BloodTypes, as: "blood_types",
						attributes: ['id', 'name']
					},
				]
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const getAllBloodTypes = await commonServices.getAndCountAll(BloodBanks, query, limit, offset)
			const response = commonServices.getPagingData(getAllBloodTypes, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData

		} catch (error) {
			throw error
		}
	},
	addDonor: async (data) => {
		try {
			const addDonorData = await commonServices.create(BloodParticipants, {
				clinic_id: data.clinicId,
				blood_bank_id: data.blood_bank_id,
				full_name: data.full_name,
				address: data.address,
				age: data.age,
				phone_no: data.phone_no,
				gender: data.gender,
				participant_type: data.participant_type,
				registration_date: data.registration_date,
				blood_components: data.blood_components,
				createdBy: data.adminId || data.userId
			})

			return addDonorData
		} catch (error) {
			throw error
		}
	},
	updateDonor: async (data) => {
		try {
			const updateDonorData = await commonServices.update(BloodParticipants, { where: { id: data.id } }, {
				blood_bank_id: data.blood_bank_id,
				full_name: data.full_name,
				address: data.address,
				age: data.age,
				phone_no: data.phone_no,
				gender: data.gender,
				participant_type: data.participant_type,
				registration_date: data.registration_date,
				blood_components: data.blood_components,
				updatedBy: data.adminId || data.userId
			})

			return updateDonorData
		} catch (error) {
			throw error
		}
	},
	viewDonorDetails: async (data) => {
		try {
			const query = {
				where: { id: data.id },
				attributes: ['full_name', 'blood_bank_id', 'age', 'gender', 'phone_no', 'registration_date', 'address', 'blood_components'],
				include: [
					{
						model: BloodBanks, as: 'blood_banks', attributes: ['id', /* 'blood_type_id' */],
						include: [
							{ model: BloodTypes, as: 'blood_types', attributes: [/* 'id', */ 'name'], }

						]
					}
				]
			}
			const donorDetails = await commonServices.get(BloodParticipants, query)

			return donorDetails
		} catch (error) {
			throw error
		}
	},
	viewAllDonorOrRecipient: async (data) => {
		try {
			var DataObj = {}
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ full_name: { [Op.like]: `%${data.s}%` } }
					]
				}
			}

			const query = {
				where: { ...DataObj, participant_type: data.type },
				attributes: ['id', 'full_name', 'createdAt'],
				include: [
					{
						model: BloodBanks, as: 'blood_banks', where: { clinic_id: data.clinicId, blood_type_id: data.bloodTypeId, },
						attributes: ['id'],
						include: [
							{ model: BloodTypes, as: 'blood_types', attributes: ['name'] }
						]
					},
				]
			}
			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const getAllBloodTypes = await commonServices.getAndCountAll(BloodParticipants, query, limit, offset)
			const response = commonServices.getPagingData(getAllBloodTypes, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData
		} catch (error) {
			throw error
		}
	},
	getClinicAllDoctor: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ "$doctors.users.full_name$": { [Op.like]: `%${data.s}%` } }
					]
				}
			}

			const query = {
				where: [DataObj, { clinic_id: data.clinicId }],
				attributes: ['id'],
				include: [
					{
						model: Doctors, as: "doctors", attributes: ['id', 'doctor_type', 'experience', 'status'],
						include: [
							{
								model: User, as: "users", attributes: ['id', 'slug', 'full_name', 'email', 'profile_image', 'countryCode', 'phone_no'],
							},
							{
								model: DoctorsEducations, as: "doctor_educations", attributes: ['id'],
								include: [
									{ model: Degrees, as: "degrees", attributes: ['id', 'name',], }
								]
							}
						]
					}

				], distinct: true
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const allEmployee = await commonServices.getAndCountAll(ClinicDoctorRelations, query, limit, offset);
			const response = await commonServices.getPagingData(allEmployee, data.page, limit);

			return response
		} catch (error) {
			throw error
		}
	},
	clinicAllDoctorDropdown: async (data) => {
		try {
			const query = {
				where: [{ clinic_id: data.clinicId }],
				attributes: ['id'],
				include: [
					{
						model: Doctors, as: "doctors", where: { status: options.DoctorStatus.APPROVE }, attributes: ['id', 'status'],
						include: [
							{
								model: User, as: "users", attributes: ['id', 'slug', 'full_name'],
							}
						]
					}

				], distinct: true
			}

			const response = await commonServices.getAll(ClinicDoctorRelations, query);

			return response
		} catch (error) {
			throw error
		}
	},
	addClinicBloodBank: async (data) => {
		try {
			const bloodTypes = await commonServices.getAll(BloodTypes)
			const bloodBank = await commonServices.getAll(BloodBanks, { where: [{ clinic_id: data.clinicId }] })

			if (bloodBank.length == 0) {
				const bloodTypeArr = []
				for (let z = 0; z < bloodTypes.length; z++) {
					const obj = {
						clinic_id: data.clinicId,
						blood_type_id: bloodTypes[z].id,
						stock: 0,
						createdBy: data.userId,
					}
					bloodTypeArr.push(obj)
				}
				const addClinicBloodBank = await commonServices.bulkCreate(BloodBanks, bloodTypeArr);
				return addClinicBloodBank
			} else {
				return false
			}
		} catch (error) {
			throw error
		}
	},
	getClinicAllJob: async (data) => {
		try {
			let DataObj = {}
			if (data.s) {
				DataObj = {
					[Op.or]: [
						{ name: { [Op.like]: `%${data.s}%` } },
						{ job_type: { [Op.like]: `%${data.s}%` } }
					]
				}
			}
			const query = {
				where: [DataObj, { clinic_id: data.clinicId },],
				attributes: ['id', 'name', 'job_type', 'location', 'salary', 'salary_time', 'degree_id', 'description', 'experience'],
				include: [
					{ model: Degrees, as: 'degrees', attributes: ['id', 'name'] },
					{ model: Speciality, as: 'jobsSpecialities', attributes: ['id', 'name'] },
				],
				order: [["createdAt", "DESC"]]
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			const getAllJob = await commonServices.getAndCountAll(Jobs, query, limit, offset);
			const response = await commonServices.getPagingData(getAllJob, data.page, limit);
			return response

		} catch (error) {
			throw error
		}
	},
	changeMachineStatus: async (data) => {
		try {
			const obj = {
				status: data.status,
				updatedBy: data.userId,
			}
			await commonServices.update(Machine, { where: { id: data.id } }, obj)
			return true

		} catch (error) {
			throw error
		}
	},
	addMachine: async (data) => {
		try {

			let obj = {
				clinic_id: data.clinicId,
				name: data.name,
				description: data.description,
				purchase_date: data.purchase_date,
				expiry_date: data.expiry_date,
				next_service_date: data.next_service_date,
				vendor_id: data.vendor_id,
				image_url: data.image_url,
				is_active: true,
				status: data.status,
				createdBy: data.userId
			}
			const addMachine = await commonServices.create(Machine, obj)
			return addMachine
		} catch (error) {
			throw error
		}
	},
	updateMachine: async (data) => {
		try {
			const obj = {
				name: data.name,
				description: data.description,
				purchase_date: data.purchase_date,
				expiry_date: data.expiry_date,
				next_service_date: data.next_service_date,
				image_url: data.image_url,
				status: data.status,
				updatedBy: data.userId,
			}
			let updatemachineData = await commonServices.update(Machine, { where: { id: data.id } }, obj);

			return updatemachineData
		} catch (error) {
			throw error
		}
	},
	ViewMachineById: async (data) => {
		try {
			let query = {
				where: [{ id: data.id }],
				attributes: ['name', 'description', 'purchase_date', 'expiry_date', 'next_service_date', 'status', 'image_url'],
				include: [
					{ model: Vendors, as: "machineVendor", attributes: ['id', 'full_name', 'phone_no', 'profile_image'] }
				]
			};

			let response = await commonServices.get(Machine, query)
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllMachine: async (data) => {
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


			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj],
				attributes: ['id', 'name', 'vendor_id', 'description', 'purchase_date', 'expiry_date', 'next_service_date', 'status', 'image_url'],
				include: [
					{ model: Vendors, as: 'machineVendor', attributes: ['id', 'full_name'] }
				]
			};

			if (data.clinicId) {
				query.where.push({ clinic_id: data.clinicId })
			}

			let getAllData = await commonServices.getAndCountAll(Machine, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData

		} catch (error) {
			throw error
		}
	},
	viewAllMachineLog: async (data) => {
		try {
			let query = {
				where: [{ machine_id: data.id }],
				attributes: ['id', 'name', 'description', 'purchase_date', 'expiry_date', 'next_service_date', 'status', 'createdBy'],
				include: [
					{ model: User, as: 'usageLog', attributes: ['id', 'full_name'] }
				]
			};
			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let getAllData = await commonServices.getAndCountAll(MachineLogs, query, limit, offset)
			const pagination = commonServices.getPagingData(getAllData, data.page, limit);

			let responseData = JSON.parse(JSON.stringify(pagination));
			return responseData

		} catch (error) {
			throw error
		}
	},
	addMachineLogs: async (data) => {
		try {
			let obj = {
				machine_id: data.machineId,
				name: data.name,
				description: data.dataValues.description,
				purchase_date: data.dataValues.purchase_date,
				expiry_date: data.dataValues.expiry_date,
				next_service_date: data.dataValues.next_service_date,
				status: data.dataValues.status,
				createdBy: data.userId
			};

			let response = await commonServices.create(MachineLogs, obj)
			return response

		} catch (error) {
			throw error
		}
	},
	addInventory: async (data) => {
		try {

			let obj = {
				vendor_id: data.vendor_id,
				expiry_date: data.expiry_date,
				next_service_date: data.next_service_date,
				purchase_date: data.purchase_date,
				name: data.name,
				amount: data.amount,
				stock: data.stock,
				clinic_id: data.clinicId,
				description: data.description,
				image_url: data.image_url,
				createdBy: data.userId
			}
			const addInventory = await commonServices.create(Machine, obj)
			return addInventory
		} catch (error) {
			throw error
		}
	},
	updateInventory: async (data) => {
		try {
			const obj = {
				vendor_id: data.vendor_id,
				expiry_date: data.expiry_date,
				next_service_date: data.next_service_date,
				purchase_date: data.purchase_date,
				name: data.name,
				amount: data.amount,
				stock: data.stock,
				description: data.description,
				image_url: data.image_url,
				updatedBy: data.userId,
			}
			let updateData = await commonServices.update(Machine, { where: { id: data.id, clinic_id: data.clinicId } }, obj);

			return updateData
		} catch (error) {
			throw error
		}
	},
	viewInventoryById: async (data) => {
		try {
			let query = {
				where: [{ id: data.id }, { clinic_id: data.clinicId, }],
				attributes: ['id', 'clinic_id', 'vendor_id', 'name', 'description', 'purchase_date', 'expiry_date', 'next_service_date', 'image_url', /* 'status', */ 'stock', 'amount'],
				include: [
					{ model: Vendors, as: "machineVendor", attributes: ['id', 'full_name', 'age', 'gender', 'profile_image'] }
				]
			};

			let response = await commonServices.get(Machine, query)
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllInventory: async (data) => {
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

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj, { clinic_id: data.clinicId }],
				attributes: ['id', 'clinic_id', 'vendor_id', 'name', 'description', 'purchase_date', 'expiry_date', 'next_service_date', 'image_url', 'status', 'stock', 'amount'],
				include: [
					{ model: Vendors, as: "machineVendor", attributes: ['id', 'full_name', 'age', 'gender', 'profile_image'] }
				]
			};

			let getAllData = await commonServices.getAndCountAll(Machine, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	changeInventoryStock: async (data) => {
		try {
			let user = await commonServices.get(Machine, { where: { id: data.id } })

			const t = await db.sequelize.transaction()
			try {

				await commonServices.update(Machine, { where: { id: data.id } }, { status: data.status }, t)
				await t.commit()
				let obj = {
					machine_id: data.id,
					name: user.name,
					description: user.description,
					purchase_date: user.purchase_date,
					expiry_date: user.expiry_date,
					next_service_date: user.next_service_date,
					status: data.status,
					createdBy: data.userId
				}

				const response = await commonServices.create(MachineLogs, obj)
				return true


			} catch (error) {

				await t.rollback()
				return error
			}


		} catch (error) {
			throw error
		}
	},
	addVendor: async (data) => {
		try {

			let obj = {
				clinic_id: data.clinicId,
				full_name: data.full_name,
				phone_no: data.phone_no,
				age: data.age,
				gender: data.gender,
				address: data.address,
				profile_image: data.profile_image,
				pincode: data.pincode,
				city: data.city,
				state: data.state,
				country: data.country,
				createdBy: data.userId
			}
			const addVendor = await commonServices.create(Vendors, obj)
			return addVendor
		} catch (error) {
			throw error
		}
	},
	updateVendor: async (data) => {
		try {
			const obj = {
				full_name: data.full_name,
				phone_no: data.phone_no,
				address: data.address,
				profile_image: data.profile_image,
				age: data.age,
				gender: data.gender,
				pincode: data.pincode,
				city: data.city,
				state: data.state,
				country: data.country,
				updatedBy: data.userId,
			}
			let updateVendorData = await commonServices.update(Vendors, { where: { id: data.id } }, obj);

			return updateVendorData
		} catch (error) {
			throw error
		}
	},
	getVendorById: async (data) => {
		try {

			let query = {
				where: [{ id: data.id }],
				attributes: ['id', 'full_name', 'phone_no', 'profile_image', 'age', 'gender', 'address', 'pincode', 'city', 'state', 'country', 'createdAt'],
			}

			let response = await commonServices.get(Vendors, query)
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllVendor: async (data) => {
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
				where: [DataObj, { clinic_id: data.clinicId, }],
				attributes: ['id', 'full_name', 'phone_no', 'profile_image', 'age', 'gender', 'address', 'pincode', 'createdAt'],
			};

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let getAllData = await commonServices.getAndCountAll(Vendors, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	addPharmacy: async (data) => {
		try {

			let obj = {
				medicine_id: data.medicine_id,
				clinic_id: data.clinicId,
				description: data.description,
				uses: data.uses,
				manufacturer: data.manufacturer,
				quantity: data.quantity,
				amount: data.amount,
				expiry_date: data.expiry_date,
				benefits_risk: data.benefits_risk,
				is_active: true,
				createdBy: data.userId
			}
			const addInventory = await commonServices.create(Pharmacy, obj)
			return addInventory
		} catch (error) {
			throw error
		}
	},
	updatePharmacy: async (data) => {
		try {
			const obj = {
				medicine_id: data.medicine_id,
				name: data.name,
				description: data.description,
				uses: data.uses,
				manufacturer: data.manufacturer,
				quantity: data.quantity,
				amount: data.amount,
				expiry_date: data.expiry_date,
				benefits_risk: data.benefits_risk,
				updatedBy: data.userId,
			}
			let updateData = await commonServices.update(Pharmacy, { where: { id: data.id, clinic_id: data.clinicId } }, obj);

			return updateData
		} catch (error) {
			throw error
		}
	},
	getAllPharmacy: async (data) => {
		try {
			let DataObj = {};
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ medicine_id: { [Op.like]: `%${data.s}%` } },
						{ '$pharmacy_medicines.name$': { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj, { clinic_id: data.clinicId }],
				attributes: ['id', 'expiry_date', 'amount', 'quantity', 'medicine_id'],
				include: [
					{ model: Medicines, as: 'pharmacy_medicines', attributes: ['id', 'name', 'dosage'] }
				]
			};

			let getAllData = await commonServices.getAndCountAll(Pharmacy, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			console.log(error);
			throw error
		}
	},
	addAmbulance: async (data) => {
		try {

			let obj = {
				clinic_id: data.clinicId,
				name: data.name,
				vehicle_no: data.vehicle_no,
				type: data.type,
				status: options.AmbulanceStatus.ACTIVE,
				description: data.description,
				createdBy: data.userId
			}
			const addAmbulance = await commonServices.create(Ambulance, obj)
			return addAmbulance
		} catch (error) {
			throw error
		}
	},
	updateAmbulance: async (data) => {
		try {
			const obj = {
				name: data.name,
				vehicle_no: data.vehicle_no,
				type: data.type,
				description: data.description,
				updatedBy: data.userId,
			}
			let updateData = await commonServices.update(Ambulance, { where: { id: data.id, clinic_id: data.clinicId } }, obj);

			return updateData
		} catch (error) {
			throw error
		}
	},
	getAmbulanceById: async (data) => {
		try {
			let query = {
				where: [{ id: data.id }, { clinic_id: data.clinicId }],
				attributes: ['id', 'name', 'vehicle_no', 'description', 'type', 'status'],
			};

			let response = await commonServices.get(Ambulance, query)
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllAmbulance: async (data) => {
		try {

			let DataObj = {};
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ name: { [Op.like]: `%${data.s}%` } },
						{ vehicle_no: { [Op.like]: `%${data.s}%` } },
						{ type: { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj, { clinic_id: data.clinicId }],
				attributes: ['id', 'name', 'vehicle_no', 'description', 'type', 'status'],
			};

			let getAllData = await commonServices.getAndCountAll(Ambulance, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllAmbulanceRequest: async (data) => {
		try {

			let DataObj = {};
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ '$ambulances.name$': { [Op.like]: `%${data.s}%` } },
						{ '$users.full_name$': { [Op.like]: `%${data.s}%` } },
						{ '$users.phone_no$': { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj],
				attributes: ['id', 'ambulance_id', 'address1', 'address2', 'status'],
				include: [
					{ model: Ambulance, as: 'ambulances', where: { clinic_id: data.clinicId }, attributes: ['id', 'name', 'type'] },
					{ model: User, as: 'users', attributes: ['id', 'full_name', 'phone_no'] }
				]
			};

			if (data.status == options.AmbulanceRequestStatus.PENDING) {
				query.where.push({ status: options.AmbulanceRequestStatus.PENDING })
			}

			if (data.status == options.AmbulanceRequestStatus.ACCEPTED) {
				query.where.push({ status: options.AmbulanceRequestStatus.ACCEPTED })
			}

			if (data.status == options.AmbulanceRequestStatus.DECLINE) {
				query.where.push({ status: options.AmbulanceRequestStatus.DECLINE })
			}

			let getAllData = await commonServices.getAndCountAll(AmbulanceRequests, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	changeAmbulanceRequestStatus: async (data) => {
		try {

			if (data.status == options.AmbulanceRequestStatus.ACCEPTED) {
				const t = await db.sequelize.transaction()
				try {
					await commonServices.update(AmbulanceRequests, { where: { id: data.id } }, { status: options.AmbulanceRequestStatus.ACCEPTED }, t)
					await commonServices.update(AmbulanceRequests, { where: [{ user_id: data.applicantUserId }, { id: { [Op.ne]: [data.id] } }] }, { status: options.AmbulanceRequestStatus.DECLINE }, t)
					await t.commit()
					return true

				} catch (error) {
					await t.rollback()
					return error
				}
			}

			if (data.status == options.AmbulanceRequestStatus.COMPLETED) {
				const t = await db.sequelize.transaction()
				try {
					await commonServices.update(AmbulanceRequests, { where: { id: data.id } }, { status: options.AmbulanceRequestStatus.COMPLETED }, t)
					await t.commit()
					return true

				} catch (error) {
					await t.rollback()
					return error
				}
			}

			if (data.status == options.AmbulanceRequestStatus.DECLINE) {
				await commonServices.update(AmbulanceRequests, { where: { id: data.id } }, { status: options.AmbulanceRequestStatus.DECLINE })
				return true
			}

		} catch (error) {
			throw error
		}
	},
	viewAllHealtAssessmentQuiz: async (data) => {
		try {


			let DataObj = {};
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ question: { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj],
				attributes: ['id', 'question', 'option_type', 'options'],
			};

			let getAllData = await commonServices.getAndCountAll(HealthAssessmentQuiz, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	addPushNotification: async (data) => {
		try {

			let obj = {
				title: data.title,
				type: data.type,
				slug: data.slug,
				description: data.description,
				image_path: data.image_path,
				is_active: true,
				createdBy: data.adminId
			}
			const AddNotification = await commonServices.create(PushNotifications, obj)
			return AddNotification
		} catch (error) {
			throw error
		}
	},
	viewAllPushNotification: async (data) => {
		try {


			let DataObj = {};
			if (data.s) {
				DataObj = {
					...DataObj,
					[Op.or]: [
						{ title: { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let query = {
				where: [DataObj],
				attributes: ['slug', 'title', 'description', 'image_path', 'type', 'createdAt'],
			};

			let getAllData = await commonServices.getAndCountAll(PushNotifications, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
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
				attributes: ['id', 'name', 'description', 'location'],
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
						{ name: { [Op.like]: `%${data.s}%` } },
					]
				}
			}

			let query = {
				where: [DataObj, { clinic_id: data.clinicId }],
				attributes: ['id', 'name', 'description', 'location'],
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
	addEmergencyContact: async (data) => {
		try {

			let obj = {
				user_id: data.userId,
				full_name: data.full_name,
				phone_no: data.phone_no,
				createdBy: data.userId
			}
			const addEmergencyContact = await commonServices.create(Sos, obj)
			return addEmergencyContact
		} catch (error) {
			throw error
		}
	},
	updateEmergencyContact: async (data) => {
		try {
			const obj = {
				full_name: data.full_name,
				phone_no: data.phone_no,
				updatedBy: data.userId,
			}
			let updateData = await commonServices.update(Sos, { where: { id: data.id } }, obj);

			return updateData
		} catch (error) {
			throw error
		}
	},
	getAllSosNumber: async (data) => {
		try {

			let query = {
				where: [{ user_id: data.userId }],
				attributes: ['id', 'full_name', 'phone_no'],
			};

			let response = await commonServices.getAll(Sos, query)
			return response

		} catch (error) {
			throw error
		}
	},
	addNotice: async (data) => {
		try {

			let obj = {
				title: data.title,
				description: data.description,
				image_url: data.image_url,
				type: data.type,
				createdBy: data.adminId
			}
			const addNotice = await commonServices.create(NoticeBoards, obj)
			return addNotice
		} catch (error) {
			throw error
		}
	},
	updateNotice: async (data) => {
		try {
			const obj = {
				title: data.title,
				description: data.description,
				image_url: data.image_url,
				type: data.type,
				updatedBy: data.adminId,
			}
			let updateData = await commonServices.update(NoticeBoards, { where: { id: data.id } }, obj);

			return updateData
		} catch (error) {
			throw error
		}
	},
	viewNoticeById: async (data) => {
		try {

			let query = {
				where: [{ id: data.id }],
				attributes: ['id', 'title', 'type', 'description', 'image_url', 'createdAt'],
			}

			let response = await commonServices.get(NoticeBoards, query)
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllNotice: async (data) => {
		try {

			let query = {
				where: [],
				attributes: ['id', 'type', 'title', 'description', 'image_url', 'createdAt'],
			};

			if (data.type) {
				query.where.push({ type: data.type })
			}

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let getAllData = await commonServices.getAndCountAll(NoticeBoards, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))

			return responseData

		} catch (error) {
			throw error
		}
	},
	addBanner: async (data) => {
		try {

			let obj = {
				banner_type: data.banner_type,
				title: data.title,
				sub_title: data.sub_title,
				description: data.description,
				image_url: data.image_url,
				link: data.link,
				createdBy: data.adminId
			}
			const addBanner = await commonServices.create(Banners, obj)
			return addBanner
		} catch (error) {
			throw error
		}
	},
	updateBanner: async (data) => {
		try {
			const obj = {
				banner_type: data.banner_type,
				title: data.title,
				sub_title: data.sub_title,
				description: data.description,
				image_url: data.image_url,
				link: data.link,
				updatedBy: data.adminId,
			}
			let updateData = await commonServices.update(Banners, { where: { id: data.id } }, obj);

			return updateData
		} catch (error) {
			throw error
		}
	},
	viewBannerById: async (data) => {
		try {

			let query = {
				where: [{ id: data.id }],
				attributes: ['id', 'banner_type', 'title', 'sub_title', 'description', 'link', 'image_url', 'createdAt'],
			}

			let response = await commonServices.get(Banners, query)
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
	getAllBanner: async (data) => {
		try {

			let query = {
				where: [],
				attributes: ['id', 'banner_type', 'title', 'sub_title', 'link', 'image_url', 'createdAt'],
			};

			const { limit, offset } = commonServices.getPagination(data.page, data.size);
			let getAllData = await commonServices.getAndCountAll(Banners, query, limit, offset)
			const response = commonServices.getPagingData(getAllData, data.page, limit);
			let responseData = JSON.parse(JSON.stringify(response))
			return responseData

		} catch (error) {
			throw error
		}
	},
}


module.exports = { methods }