const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: clinicServices } = require("../../../../services/clinic")
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment')

const HealthCamp = db.health_camps;


// view all health camp
exports.viewAllBanners = async (req, res) => {
  try {
    const { page, size, s } = req.query;
    const clinicId = req.user.clinics.id;

    const data = await clinicServices.getClinicAllBanners({ clinicId, page, size, s })
    const response = JSON.parse(JSON.stringify(data))

    return res.status(200).json({ success: "true", message: message.GET_DATA("Banner"), data: response })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

