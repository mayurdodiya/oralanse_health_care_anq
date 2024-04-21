const moment = require("moment");
const options = require("../../../../config/options");


module.exports = {
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