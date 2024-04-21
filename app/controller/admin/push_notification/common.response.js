const db = require("../../../models");
const moment = require("moment");
module.exports = {
  logResponse: (Id, Name, parentSpecialistId, imagePath) => {
    return (response = {
      id: Id,
      name: Name,
      parent_specialist_id: parentSpecialistId,
      image_path: imagePath,
    });
  },

  modifyRes: (response) => {

    const obj = response.data.map(item => {
      return {
        slug: item.slug,
        title: item.title,
        description: item.description,
        image_path: item.image_path,
        type: item.type,
        createdAt: item.createdAt
      }
    })
    return obj
  }
};