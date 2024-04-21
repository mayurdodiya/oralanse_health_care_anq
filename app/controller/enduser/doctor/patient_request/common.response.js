const moment = require("moment")
const options = require("../../../../config/options")

module.exports = {
    viewAllPastHistory: (data) => {
        const obj = data.map(i => {
            return {
                id: i.id,
                createdAt: i.createdAt,
                problem_info: i.problem_info,
                doctor_notes: i.doctor_notes,
                status: i.status,
                clinicdata: i.clinicdata,
                doctors: i.doctors,
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