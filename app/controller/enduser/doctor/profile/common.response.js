module.exports = {
    modifyUser: (response) => {
        const obj = {
            id: response.user.id,
            role_id: response.user.role_id,
            is_active: response.user.is_active,
            full_name: response.user.full_name,
            email: response.user.email,
            slug: response.user.slug,
            countryCode: response.user.countryCode,
            phone_no: response.user.phone_no,
            profile_image: response.user.profile_image,
            language_id: response.userdetails.language_id,
            active_profile: response.userdetails.active_profile,
            location: response.userdetails.location,
            latitude: response.userdetails.latitude,
            longitude: response.userdetails.longitude,
            unique_id: response.patient.unique_id,
            relationship: response.patient.relationship,
        }
        return obj
    },
    modifyProfile: (response) => {
        const obj = {
            id: response.id,
            role_id: response.role_id,
            full_name: response.full_name,
            email: response.email,
            slug: response.slug,
            countryCode: response.countryCode,
            phone_no: response.phone_no,
            profile_image: response.profile_image,
            address1: response.user_details.address1,
            address2: response.user_details.address2,
            pincode: response.user_details.pincode,
            area: response.user_details.areas.name,
            city_name: response.user_details.areas.cities.city_name,
            state_name: response.user_details.areas.cities.state_name,
            country_name: response.user_details.areas.cities.country_name,
            latitude: response.user_details.latitude,
            longitude: response.user_details.longitude,
            patient_id: response.patients.id,
            unique_id: response.patients.unique_id,
            gender: response.patients.gender,
            age: response.patients.age,
            has_insurance: response.patients.has_insurance,
            relationship: response.patients.relationship,
            patient_insurance: response.patients.patient_insurance != null ? response.patients.patient_insurance : null
        }
        return obj
    }
}