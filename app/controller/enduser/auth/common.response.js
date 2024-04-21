module.exports = {
    modifyUser: (response) => {
        const obj = {
            id: response.user.id,
            role_id: response.user.role_id,
            is_active: response.user.is_active,
            full_name: response.user.full_name,
            email: response.user.email,
            firebase_uid: response.user.firebase_uid,
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
            area: response.user_details.areas != null ? response.user_details.areas.name : null,
            city_name: response.user_details.areas != null ? response.user_details.areas.cities.city_name : null,
            state_name: response.user_details.areas != null ? response.user_details.areas.cities.state_name : null,
            country_name: response.user_details.areas != null ? response.user_details.areas.cities.country_name : null,
            latitude: response.user_details.latitude,
            longitude: response.user_details.longitude,
            patient_id: response.patients != null ? response.patients.id : null,
            unique_id: response.patients != null ? response.patients.unique_id : null,
            gender: response.patients != null ? response.patients.gender : null,
            age: response.patients != null ? response.patients.age : null,
            has_insurance: response.patients != null ? response.patients.has_insurance : null,
            relationship: response.patients != null ? response.patients.relationship : null,
            patient_insurance: response.patients != null ? (response.patients.patient_insurance != null ? response.patients.patient_insurance : null) : null
        }
        return obj
    },
    modifySwitchProfile: (response) => {
        const obj = {
            id: response.id,
            role_id: response.role_id,
            full_name: response.full_name,
            email: response.email,
            slug: response.slug,
            countryCode: response.countryCode,
            phone_no: response.phone_no,
            profile_image: response.profile_image,
            is_active: response.is_active,
            firebase_uid: response.firebase_uid,
            address1: response.user_details.address1,
            address2: response.user_details.address2,
            pincode: response.user_details.pincode,
            gender: response.user_details.gender,
            age: response.user_details.age,
            language_id: response.user_details.language_id,
            location: response.user_details.location,
            latitude: response.user_details.latitude,
            longitude: response.user_details.longitude,
            unique_id: response.patients.unique_id,
        }
        return obj
    },
}