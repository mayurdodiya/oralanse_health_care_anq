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



const Diseases = db.diseases;
const Speciality = db.specialities;



// add diseases
exports.addDiseases = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(Diseases, query);

    if (isExistingData == null) {

      let obj = {
        name: req.body.name,
        speciality_id: req.body.speciality_id,
        description: req.body.description,
        createdBy: adminId
      }
      const data = await commonServices.create(Diseases, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Diseases data"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Diseases") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Diseases") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit diseases by id
exports.updateDiseasesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Diseases, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This diseases data") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Diseases, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This diseases data") });
    }

    const obj = {
      name: req.body.name,
      speciality_id: req.body.speciality_id,
      description: req.body.description,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Diseases, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Diseases data") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Diseases data") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete diseases by id
exports.deleteDiseasesById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Diseases, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This diseases data") });
    }


    let data = await commonServices.delete(Diseases, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Diseases data") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Diseases data") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view diseases by id
exports.viewDiseasesById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(Diseases, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This diseases data") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'description', 'speciality_id'],
      include: [
        { model: Speciality, as: "diseases_specialities", attributes: ['name'] }
      ]
    };
    let data = await commonServices.get(Diseases, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Diseases data"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This diseases data"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all diseases
exports.viewAllDiseases = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    let query = {
      where: [DataObj],
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ['id', 'name', 'description', 'speciality_id'],
      include: [
        { model: Speciality, as: "diseases_specialities", attributes: ['name'] }
      ]
    };

    let data = await commonServices.getAndCountAll(Diseases, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("Diseases data"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This diseases data") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
