const db = require("../../../models");
module.exports = {
  logResponse: (data, creationTime) => {
    return (response = {
      "id": data.id,
      "full_name": data.full_name,
      "email": data.email,
      "countryCode": data.countryCode,
      "phone_no": data.phone_no,
      "profile_image": data.profile_image,
      "createdAt": creationTime,

      "address1": data.user_details.address1,
      "address2": data.user_details.address2 ? data.user_details.address2 : null,
      "pincode": data.user_details.areas.pincode,
      "city_name": data.user_details.areas.cities.city_name,
      "state_name": data.user_details.areas.cities.state_name,
      "country_name": data.user_details.areas.cities.country_name,

      "patients": data.patients.length != 0 ?
        {
          "id": data.patients.id,
          "unique_id": data.patients.unique_id,
          "gender": data.patients.gender,
          "age": data.patients.age,
          "relationship": data.patients.relationship,
          "reward_balance": data.patients.reward_balance,
          "cash_balance": data.patients.cash_balance,
          "has_insurance": data.patients.has_insurance
        } : []

    });
  },
};