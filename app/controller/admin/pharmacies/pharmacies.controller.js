const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;



const Pharmacies = db.pharmacies;



// add pharmacies
exports.addPharmacies = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name, company_name: req.body.company_name } };
    const isExistingData = await commonServices.get(Pharmacies, query);

    if (isExistingData == null) {
      let obj = {
        name: req.body.name.toLowerCase(),
        company_name: req.body.company_name,
        type: req.body.type.toLowerCase(),
        is_active: true,
        createdBy: adminId
      }
      const data = await commonServices.create(Pharmacies, obj)
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Medicine") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Medicine") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("This medicine") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit pharmacies by id
exports.updatePharmaciesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Pharmacies, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This medicine") });
    }

    const query = { where: [{ name: req.body.name, company_name: req.body.company_name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Pharmacies, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This medicine") });
    }

    const obj = {
      name: req.body.name.toLowerCase(),
      company_name: req.body.company_name,
      type: req.body.type.toLowerCase(),
      updatedBy: adminId,
    }
    let data = await commonServices.update(Pharmacies, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Medicine") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Medicine") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete pharmacies by id
exports.deletePharmaciesById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Pharmacies, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This medicine") });
    }

    let data = await commonServices.delete(Pharmacies, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Medicine") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Medicine") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view pharmacies by id
exports.viewPharmaciesById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'company_name', 'type', 'is_active'],
    };
    let data = await commonServices.get(Pharmacies, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Medicine"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This medicine") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all pharmacies
exports.viewAllPharmacies = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { name: { [Op.like]: `%${s}%` } },
          { company_name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'name', 'company_name', 'type', 'is_active'],
    };

    let data = await commonServices.getAndCountAll(Pharmacies, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))
      res.status(200).json({ success: "true", message: message.GET_DATA("Medicine"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This medicine") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};


// active pharmacies status
exports.updatePharmaciesStatus = async (req, res) => {
  try {

    const roleId = 3;
    const id = req.params.id;
    const user = await commonServices.get(Pharmacies, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Medicine") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changePharmacyStatus(id, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Medicine") });
    } else {
      const status = true
      await contentServices.changePharmacyStatus(id, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Medicine") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};