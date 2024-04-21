const moment = require("moment")
module.exports = {
    modifyRequestRes: (response) => {
        const obj = response.data.map(i => {
            return {
                id: i.id,
                doctor_id: i.doctor_id,
                full_name: i.doctors_request.users.full_name,
                phone_no: i.doctors_request.users.phone_no,
                email: i.doctors_request.users.email,
            }
        })
        return obj
    },
}