const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: clinicServices } = require("../../../services/clinic");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;



const LabTests = db.lab_tests;
const LabTestsValues = db.lab_test_values;
const LabTestsClinics = db.lab_test_clinics;



// add lab tests
exports.addLabTests = async (req, res) => {
  try {
    const adminId = req.user.id;
    const isExistingData = await commonServices.get(LabTests, { where: { name: { [Op.like]: req.body.name } } });

    if (isExistingData == null) {
      const data = await clinicServices.addLabTest({ adminId, ...req.body })
      if (data) {
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Lab tests") })
      } else {
        return res.status(200).json({ success: "false", message: message.CREATE_FAILD("Lab tests") });
      }

    } else {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("Lab tests") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit lab tests by id
exports.updateLabTestsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(LabTests, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This lab tests") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(LabTests, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This lab tests") });
    }

    const data = await clinicServices.updateLabTest({ adminId, id, ...req.body })
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Lab tests") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Lab tests") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete lab tests by id
exports.deleteLabTestsById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(LabTests, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This lab tests") });
    }
    const t = await db.sequelize.transaction()
    try {
      await commonServices.delete(LabTests, { where: { id: id } }, t);
      await commonServices.delete(LabTestsValues, { where: { lab_test_id: id } }, t);
      await commonServices.delete(LabTestsClinics, { where: { lab_test_id: id } }, t);
      await t.commit();
      return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Lab tests") });

    } catch (error) {
      await t.rollback()
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view lab tests by id
exports.viewLabTestsById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(LabTests, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This lab tests") });
    }

    const data = await clinicServices.viewLabTestById({ id })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Lab tests"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This lab tests") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all lab tests
exports.viewAllLabTests = async (req, res) => {
  try {

    const { page, size, s } = req.query;
    let data = await clinicServices.getAllLabTest({ page, size, s })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Lab tests"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This lab tests") })
    }

  } catch (error) {
    console.log(error);
    res.status(200).json({ success: " false", message: error.message })
  }

};

