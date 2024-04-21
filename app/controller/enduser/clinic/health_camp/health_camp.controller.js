const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: clinicServices } = require("../../../../services/clinic")
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment')

const HealthCamp = db.health_camps;


// add health camp
exports.addHealthCamp = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;

    const isExist = await commonServices.get(HealthCamp, { where: [{ name: req.body.name }, { clinic_id: clinicId }] })
    if (isExist != null) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Health camp data") })
    }

    const data = await clinicServices.addHealthCamp({ userId, clinicId, ...req.body })
    if (data != null) {
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Health camp") })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Health camp") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// update health camp
exports.updateHealthCamp = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const clinicId = req.user.clinics.id;

    const data = await clinicServices.updateHealthCamp({ clinicId, userId, id, ...req.body })
    if (data == 1) {
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Health camp data") })
    } else {
      return res.status(200).json({ success: "false", message: message.UPDATE_PROFILE_FAILED("Health camp") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete health camp
exports.deleteHealthCamp = async (req, res) => {
  try {
    const id = req.params.id;
    const clinicId = req.user.clinics.id;

    const isExist = await commonServices.get(HealthCamp, { where: [{ id: id }, { clinic_id: clinicId }] })
    if (isExist == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This health camp data") })
    }

    const data = await commonServices.delete(HealthCamp, { where: { id: id } })
    if (data == 1) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Health camp data") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Health camp") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view all health camp
exports.viewAllHealthCamp = async (req, res) => {
  try {
    const { page, size, s } = req.query;
    const clinicId = req.user.clinics.id;

    const data = await clinicServices.getAllHealthCamp({ clinicId, page, size, s })
    const response = JSON.parse(JSON.stringify(data))

    return res.status(200).json({ success: "true", message: message.GET_DATA("Health camp"), data: response })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// // add health camp patients
// exports.addHealthCampPatients = async (req, res) => {
//   try {
//     const { page, size, s } = req.query;
//     const campId = req.params.id;

//     const data = await clinicServices.getAllHealthCampPatients({ campId, page, size, s })
//     const response = JSON.parse(JSON.stringify(data))

//     return res.status(200).json({ success: "true", message: message.GET_DATA("Health camp"), data: response })

//   } catch (error) {
//     res.status(200).json({ success: "false", message: error.message })
//   }
// };

// view health camp all patients
exports.viewAllHealthCampPatients = async (req, res) => {
  try {
    const { page, size, s } = req.query;
    const campId = req.params.id;

    const data = await clinicServices.getAllHealthCampPatients({ campId, page, size, s })
    const response = JSON.parse(JSON.stringify(data))

    return res.status(200).json({ success: "true", message: message.GET_DATA("Health camp patients"), data: response })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};
