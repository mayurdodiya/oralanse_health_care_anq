// const commonConfig = require('../../../config/common.config');
const db = require("../../../models");
module.exports = {
  logResponse: (Id, Name, parentSpecialistId, imagePath) => {
    return (response = {
      id: Id,
      name: Name,
      parent_specialist_id: parentSpecialistId,
      image_path: imagePath,
    });
  },
};