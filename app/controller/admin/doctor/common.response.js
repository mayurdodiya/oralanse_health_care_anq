const db = require("../../../models");
module.exports = {
  logInRes: (response, joiningDate) => {

    const doctorEducation = response.doctors.doctor_educations.map(item => {
      return {
        id: item.id,
        degrees: {
          id: item.degrees.id,
          degrees: item.degrees.name,
        },
        colleges: {
          id: item.colleges.id,
          colleges: item.colleges.name,
        }
      }
    });
    const doctorSpecialities = response.doctors.doctor_specialities.map(item => {
      return {
        id: item.id,
        specialities: {
          id: item.specialities.id,
          name: item.specialities.name,
          image_path: item.specialities.image_path
        }
      }
    });


    const allClinicData = response.doctors.clinic_doctor_relations.map(item => {
      return {
        "clinic_id": item.clinics.id,
        "clinic_status": item.clinics.status,
        "clinic_name": item.clinics.clinic_name,
        "clinic_number": item.clinics.clinic_phone_number,
        "consultation_fees": item.clinics.consultation_fees,
        "clinic_document_type": item.clinics.document_type,

        "document_image": item.clinics.document_path,
        "address": item.clinics.address,
        "clinic_area": item.clinics.areas.name,
        "clinic_pincode": item.clinics.areas.pincode,
        "clinic_city": item.clinics.areas.cities.city_name,
        "clinic_country": item.clinics.areas.cities.country_name,

        "clinic_speciality": item.clinics.clinic_specialities,
        "clinic_facility": item.clinics.clinic_facilities,
        "clinic_services": item.clinics.clinic_treatments,
      }
    });

    return (response = {
      "id": response.id,
      "full_name": response.full_name,
      "email": response.email,
      "country_code": response.countryCode,
      "mobile": response.phone_no,
      "profile_image": response.profile_image,
      "address1": response.user_details.address1,
      "city": response.user_details.areas.cities.city_name,
      "state": response.user_details.areas.cities.state_name,
      "country": response.user_details.areas.cities.country_name,

      "doctor_id": response.doctors.id,
      "doctor_status": response.doctors.status,
      "experience": response.doctors.experience,
      "joining_date": joiningDate,
      "document_type": response.doctors.document_type,
      "front_side_document": response.doctors.front_side_document,
      "back_side_document": response.doctors.back_side_document,
      "doctor_educations": doctorEducation,
      "doctor_specialities": doctorSpecialities,
      "clinics": allClinicData,
    });
  },

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
        "areas": response.user_details.areas ? {
          "id": response.user_details.areas.id,
          "pincode": response.user_details.areas.pincode,
          "cities": {
            "id": response.user_details.areas.cities.id,
            "city_name": response.user_details.areas.cities.city_name,
            "state_name": response.user_details.areas.cities.state_name,
            "country_name": response.user_details.areas.cities.country_name
          }
        } : null,
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
        "clinic_doctor_relations": response.doctors.clinic_doctor_relations
      },

    })
  },
};