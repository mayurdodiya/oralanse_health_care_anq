const moment = require("moment")
const options = require("../../../config/options")
module.exports = {
    modifyRes: (response) => {

        const obj = response.data.map(items => {
            return {
                id: items.id,
                // status: items.status,
                createdAt: items.createdAt,
                oral_screening_requests: items.oral_screening_requests.length != 0 ?
                    items.oral_screening_requests.map(items => {
                        return {
                            id: items.id,
                            patient_id: items.patient_id,
                            full_name: items.oral_screening_patients.usersData.full_name,
                            profile_image: items.oral_screening_patients.usersData.profile_image,
                            email: items.oral_screening_patients.usersData.email,
                            status: items.status,
                        }
                    }) : [],
            }
        })
        return obj
    }
}