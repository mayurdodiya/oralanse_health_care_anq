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



const InsuranceCompanies = db.insurance_companies;



// add insurance companies
exports.addInsuranceCompany = async (req, res) => {
  try {
    const adminId = req.user.id;
    const isExistingData = await commonServices.get(InsuranceCompanies, { where: { company_name: req.body.company_name } });

    if (isExistingData == null) {
      const data = await clinicServices.addInsuranceCompany({ adminId, ...req.body })
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Insurance companies") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Insurance companies") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Insurance companies") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit insurance companies by id
exports.updateInsuranceCompanyById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(InsuranceCompanies, { where: { id: id } })
    if (!user) {




      
      return res.status(200).json({ success: "false", message: message.NO_DATA("This insurance companies") });
    }

    const query = { where: [{ company_name: req.body.company_name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(InsuranceCompanies, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This insurance companies") });
    }

    const data = await clinicServices.updateInsuranceCompanyById({ adminId, id, ...req.body })
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Insurance companies") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Insurance companies") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete insurance companies by id
exports.deleteInsuranceCompanyById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(InsuranceCompanies, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This insurance companies") });
    }

    let data = await commonServices.delete(InsuranceCompanies, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Insurance companies") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Insurance companies") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view insurance companies by id
exports.viewInsuranceCompanyById = async (req, res) => {

  try {
    const id = req.params.id
    const user = await commonServices.get(InsuranceCompanies, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This insurance companies") });
    }

    const data = await clinicServices.viewInsuranceCompanyById({ id })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Insurance companies"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This insurance companies") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all insurance companies
exports.viewAllInsuranceCompany = async (req, res) => {
  try {

    const { page, size, s } = req.query;
    let data = await clinicServices.viewAllInsuranceCompany({ page, size, s })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Insurance companies"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This insurance companies") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// insurance companies dropdown
exports.insuranceCompanies = async (req, res) => {
  try {

    let query = {
      where: [],
      attributes: ['id', 'company_name', 'phone_no', 'image_url', 'address'],
  };

  let data = await commonServices.getAll(InsuranceCompanies, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Insurance companies"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This insurance companies") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};