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
}


