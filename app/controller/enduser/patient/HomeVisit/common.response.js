const moment = require("moment");
module.exports = {
    modifyClinicProfile: (response) => {
        const obj = response.map(item => {
            return {
                id: item.id,
                user_id: item.user_id,
                slug: item.users.slug,
                clinic_name: item.clinic_name,
                clinic_type: item.clinic_type,
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
                    }) : []
            }
        })
        return obj
    }
}