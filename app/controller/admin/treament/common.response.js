// const commonConfig = require('../../../config/common.config');
const db = require("../../../models");
module.exports = {
  logInRes: (Name, specialityId, imagePath) => {
    return (response = {
      name: Name,
      speciality_id: specialityId,
      image_path: imagePath,
    });
  },
};
