const moment = require("moment");
const options = require("../../../../config/options");
module.exports = {
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
                clinic_lab: item.clinicLabTest.length != 0 ?
                    item.clinicLabTest.map(i => {
                        return {
                            id: i.id,
                            lab_test_id: i.lab_test_id,
                            category: i.lab_tests.category,
                            sub_category: i.lab_tests.sub_category,
                            name: JSON.parse(i.lab_tests.name),
                            price: i.price
                        }
                    }) : [],
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
                createdAt: item.createdAt,
                patientdata: item.patientdata,
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
    }
}