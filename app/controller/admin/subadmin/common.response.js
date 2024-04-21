// const commonConfig = require('../../../config/common.config');
const db = require("../../../models");
module.exports = {
  logInRes: (Id, slug, email, firstName, lastName, countryCode, phoneNo, profileImage, walletBalance, isActive, address1, address2, city, state, country/* , clinicName, cityId, areaId, address, latitude, longitude, clinicPhoneNumber, reviewComment, documentPath, specialistId, serviceId, dayOfWeek, inClinicAppointment, videoAppointment */) => {
    return (response = {
      "id": Id,
      "slug": slug,
      "email": email,
      "first_name": firstName,
      "last_name": lastName,
      "country_code": countryCode,
      "phoneno": phoneNo,
      "profile_image": profileImage,
      "wallet_balance": walletBalance,
      "is_active": isActive,

      "address1": address1,
      "address2": address2,
      "city": city,
      "state": state,
      "country": country
    });
  },
};


