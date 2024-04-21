const moment = require("moment");
const options = require("../../../../config/options");
module.exports = {
    modifyDoctorProfile: (response) => {
        const obj = response.map(item => {
            return {
                id: item.id,
                user_id: item.user_id,
                bio: item.bio,
                slug: item.users.slug,
                prefix: item.prefix,
                doctor_type: item.doctor_type,
                rating_point: item.rating_point,
                joining_date: moment(item.createdAt).format(options.DateFormat.DATE),
                experience: item.experience,
                known_language: item.known_language,
                consultation_fees: item.consultation_fees,
                full_name: item.users.full_name,
                profile_image: item.users.profile_image,
                doctor_educations: item.doctor_educations,
                doctor_timing: item.doctor_timing,
                review_count: item.doctorReview.length,
                doctor_specialities: item.doctor_specialities.length != 0 ?
                    item.doctor_specialities.map(i => {
                        return {
                            id: i.specialities.id,
                            name: i.specialities.name,
                        }
                    }) : [],
                doctorAchievement: item.doctorAchievement.length != 0 ?
                    item.doctorAchievement.map(i => {
                        return i.name
                    }) : [],
                totalAchievement: item.doctorAchievement.length != 0 ?
                    item.doctorAchievement.length : 0,
                doctor_clinic: item.clinic_doctor_relations.length != 0 ?
                    item.clinic_doctor_relations.map(i => {
                        return i.clinics.clinic_name
                    }) : [],
                appointment_selection: options.appointmentLimit.DOCTOR_SELECTION
            }
        })
        return obj
    },
    modifyClinicProfile: (response) => {
        const obj = response.map(item => {
            return {
                id: item.id,
                user_id: item.user_id,
                slug: item.users.slug,
                clinic_name: item.clinic_name,
                clinic_type: item.clinic_type,
                rating_point: item.rating_point,
                clinic_phone_number: item.clinic_phone_number,
                address: item.address,
                pincode: item.pincode,
                bio: item.bio,
                service_24X7: item.service_24X7,
                consultation_fees: item.consultation_fees,
                equipments: item.equipments,
                clinic_image: item.clinic_image,
                has_NABH: item.has_NABH,
                NABH_certificate_path: item.NABH_certificate_path,
                has_iso: item.has_iso,
                iso_certificate_path: item.iso_certificate_path,
                has_lab: item.has_lab,
                clinic_timings: item.clinic_timings,
                review_count: item.clinicReview.length,
                clinic_bed: item.clinicBed.length,
                clinic_specialities: item.clinic_specialities.length != 0 ?
                    item.clinic_specialities.map(i => {
                        return {
                            id: i.specialities.id,
                            name: i.specialities.name,
                        }
                    }) : [],
                clinic_facilities: item.clinic_facilities.length != 0 ?
                    item.clinic_facilities.map(i => {
                        return i.facilities.name
                    }) : [],
                appointment_selection: options.appointmentLimit.HOSPITAL_SELECTION
            }
        })
        return obj
    },
    modifyAppointment: (response) => {
        const obj = response.map(item => {
            return {
                id: item.id,
                appointment_type: item.appointment_type,
                patient_id: item.patient_id,
                status: item.status,
                slot_timing: item.slot_timing,
                problem_info: item.problem_info,
                treatment_id: item.treatment_id,
                type: item.type,
                speciality_id: item.speciality_id,
                createdAt: item.createdAt,
                patientdata: item.patientdata,
                treatment_for: item.treatmentdata != null ? item.treatmentdata.name : item.specialitydata.name,
                doctor_data: item.doctors != null ? {
                    id: item.doctors.id,
                    user_id: item.doctors.user_id,
                    doctor_type: item.doctors.doctor_type,
                    prefix: item.doctors.prefix,
                    full_name: item.doctors.users.full_name,
                    experience: item.doctors.experience,
                    profile_image: item.doctors.users.profile_image,
                    doctor_specialities: item.doctors.doctor_specialities
                } : null,
                clinic_data: item.clinicdata != null ? {
                    id: item.clinicdata.id,
                    user_id: item.clinicdata.user_id,
                    clinic_name: item.clinicdata.clinic_name,
                    clinic_type: item.clinicdata.clinic_type,
                    clinic_image: item.clinicdata.clinic_image,
                    clinic_specialities: item.clinicdata.clinic_specialities
                } : null
            }
        })
        return obj
    },
    modifyPastHistory: (response) => {
        const obj = response.map(item => {
            return {
                id: item.id,
                appointment_type: item.appointment_type,
                patient_id: item.patient_id,
                slot_date: moment(item.slot_timing).format(options.DateFormat.DATE),
                slot_timing: moment(item.slot_timing).format(options.DateFormat.TIME),
                problem_info: item.problem_info,
                treatment_id: item.treatment_id,
                speciality_id: item.speciality_id,
                patient_data: item.patientdata,
                treatment_for: item.treatmentdata != null ? item.treatmentdata.name : item.specialitydata.name,
                doctor_data: item.doctors != null ? {
                    id: item.doctors.id,
                    user_id: item.doctors.user_id,
                    doctor_type: item.doctors.doctor_type,
                    full_name: `${item.doctors.prefix} ${item.doctors.users.full_name}`,
                    profile_image: item.doctors.users.profile_image,
                    experience: item.doctors.experience
                } : null,
                clinic_data: item.clinicdata != null ? {
                    id: item.clinicdata.id,
                    user_id: item.clinicdata.user_id,
                    clinic_name: item.clinicdata.clinic_name,
                    clinic_type: item.clinicdata.clinic_type,
                    clinic_image: item.clinicdata.clinic_image
                } : null
            }
        })
        return obj
    }
}