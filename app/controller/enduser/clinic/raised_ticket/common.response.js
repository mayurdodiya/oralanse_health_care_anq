const moment = require("moment")
const options = require("../../../../config/options");


module.exports = {
  modifyRes: (response) => {
    const obj = response.data.map(i => {
      return {
        subject: i.subject,
        message: i.message,
        status: i.status,
        createdAt: i.createdAt
      }
    });
    return obj
  }
}