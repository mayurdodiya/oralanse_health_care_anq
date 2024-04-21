const moment = require("moment")
const options = require("../../../../config/options")

module.exports = {
    viewAllJobsResponse: (data) => {

        const objs = data.map(item => {
            return {
                id: item.id,
                company_name: item.company_name,
                image_path: item.image_path,
                name: item.name,
                description: item.description,
                experience: item.experience,
                location: item.location,
                salary: item.salary,
                job_type: item.job_type,
                createdAt: item.createdAt
            }
        })
        return objs
    },
    modifyAppointment: (response) => {
        const obj = response.data.map(item => {
            return {
                id: item.id,
                appointment_type: item.appointment_type,
                unique_id: item.patients.unique_id,
                full_name: item.patients.full_name,
                profile_image: item.patients.usersData.profile_image,
                createdAt: item.createdAt,
                problem_info: item.appointments.problem_info,
                slot_timing: item.appointments.slot_timing,
                is_addon: item.is_addon,
                addon_status: item.addon_status,
            }
        })
        return obj
    }

}