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


const RegistrationCouncils = db.registration_councils;



// add registration council
exports.addRegistrationCouncil = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(RegistrationCouncils, query);

    if (isExistingData == null) {

      let obj = {
        slug: commonServices.generateSlug(req.body.name),
        name: req.body.name,
        createdBy: adminId
      }
      const data = await commonServices.create(RegistrationCouncils, obj)
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Registration council") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Registration council") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Registration council") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit registration council by id
exports.updateRegistrationCouncilById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const slug = req.params.slug
    const user = await commonServices.get(RegistrationCouncils, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This registration council") });
    }
    const id = user.id

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(RegistrationCouncils, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.EXIST("This registration council") });
    }

    const obj = {
      name: req.body.name,
      updatedBy: adminId,
    }
    let data = await commonServices.update(RegistrationCouncils, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Registration council") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Registration council") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete registration council by id
exports.deleteRegistrationCouncilById = async (req, res) => {
  try {

    const slug = req.params.slug
    const user = await commonServices.get(RegistrationCouncils, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This registration council") });
    }


    let data = await commonServices.delete(RegistrationCouncils, { where: { slug: slug } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Registration council") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Registration council") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view registration council by id
exports.viewRegistrationCouncilById = async (req, res) => {

  try {
    const slug = req.params.slug;

    let query = {
      where: { slug: slug },
      attributes: ['id', 'name', 'slug'],
    };
    let data = await commonServices.get(RegistrationCouncils, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Registration council"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This registration council") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all registration council
exports.viewAllRegistrationCouncil = async (req, res) => {

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
      attributes: ['id', 'name', 'slug'],
    };

    let data = await commonServices.getAndCountAll(RegistrationCouncils, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("Registration council"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This registration council") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
