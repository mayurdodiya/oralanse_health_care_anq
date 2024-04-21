// const commonConfig = require('../../../config/common.config');
const db = require("../../../models");
module.exports = {
  logResponse: (data, jsondata) => {
    return (response = {
      id: data.id,
      question: data.question,
      option_type: data.option_type,
      options: jsondata,
    });
  },
};