const db = require("../../../../models");
const moment = require("moment");
const options = require("../../../../config/options")

module.exports = {
  logResponse: (response) => {
    const obj = response.data.map(item => {
      return {
        id: item.id,
        name: item.name,
        image_path: item.image_path,
        createdAt: item.createdAt,
        full_name: item.doctors.users.full_name,
      }

    })
    return obj
  },
};