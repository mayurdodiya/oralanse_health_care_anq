module.exports = {
    logInRes: (responseData, modifyDate) => {
        return response = {

            "id": responseData.id,
            "slug": responseData.slug,
            "full_name": responseData.full_name,
            "email": responseData.email,
            "countryCode": responseData.countryCode,
            "phone_no": responseData.phone_no,
            "profile_image": responseData.profile_image,
            "createdAt": modifyDate,

            "address1": responseData.user_details.address1,
            "address2": responseData.user_details.address2,
            "pincode": responseData.user_details.pincode,

            "city_name": responseData.user_details.areas != null ? responseData.user_details.areas.cities.city_name : null,
            "state_name": responseData.user_details.areas != null ? responseData.user_details.areas.cities.state_name : null,
            "country_name": responseData.user_details.areas != null ? responseData.user_details.areas.cities.country_name : null,

        }
    }
}