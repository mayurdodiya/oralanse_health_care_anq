const db = require('../../../models');
module.exports = {
  logInRes: (response) => {
    return response = {
      id: response.isExistingEmail.id,
      slug: response.isExistingEmail.slug,
      role_id: response.isExistingEmail.role_id,
      full_name: response.isExistingEmail.full_name,
      accessToken: response.token,
      profile_image: response.isExistingEmail.profile_image,
      firebase_uid: response.firebase_id,
    }
  },
  modifyAdminRes: (response) => {
    const obj = {
      id: response.id,
      full_name: response.full_name,
      email: response.email,
      slug: response.slug,
      countryCode: response.countryCode,
      phone_no: response.phone_no,
      profile_image: response.profile_image,
      address1: response.user_details.address1,
      address2: response.user_details.address2,
      gender: response.user_details.gender,
      age: response.user_details.age,
      pincode: response.user_details.pincode,
      areas: response.user_details.areas,
    }
    return obj
  }
}
