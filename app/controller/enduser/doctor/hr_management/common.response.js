module.exports = {
    modifyResponse: (response) => {

        return (response = {
          "id": response.id,
          "full_name": response.full_name,
          "email": response.email,
          "countryCode": response.countryCode,
          "phone_no": response.phone_no,
          "profile_image": response.profile_image,
          "user_details": {
            "address1": response.user_details.address1,
            "address2": response.user_details.address2,
            "areas": {
              "id": response.user_details.areas.id,
              "pincode": response.user_details.areas.pincode,
              "cities": {
                "id": response.user_details.areas.cities.id,
                "city_name": response.user_details.areas.cities.city_name,
                "state_name": response.user_details.areas.cities.state_name,
                "country_name": response.user_details.areas.cities.country_name
              }
            }
          },
          "doctors": {
            "id": response.doctors.id,
            "status": response.doctors.status,
            "doctor_type": response.doctors.doctor_type,
            "experience": response.doctors.experience,
            "createdAt": response.doctors.createdAt,
            "document_type": response.doctors.document_type,
            "front_side_document": response.doctors.front_side_document,
            "back_side_document": response.doctors.back_side_document,
            "doctor_educations": response.doctors.doctor_educations,
            "doctor_specialities": response.doctors.doctor_specialities,
          },
    
        })
      },
}