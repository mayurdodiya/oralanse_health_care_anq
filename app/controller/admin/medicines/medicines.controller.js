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



const Medicines = db.medicines;



// add medicines
exports.addMedicines = async (req, res) => {
  try {
    const adminId = req.user.id;
    const isExistingData = await commonServices.get(Medicines, { where: { name: req.body.name } });

    if (isExistingData == null) {
      const data = await clinicServices.addMedicines({ adminId, ...req.body })
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Medicines") })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Medicines") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Medicines") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// // edit medicines by id
// exports.updateMedicinesById = async (req, res) => {
//   try {
//     const adminId = req.user.id;
//     const isExistingData = await commonServices.get(Medicines, { where: { name: req.body.name } });



//     if (isExistingData == null) {
//       const data = await clinicServices.updateMedicines({ adminId, ...req.body })
//       if (data) {
//         res.status(200).json({ success: "true", message: message.ADD_DATA("Medicines") })
//       } else {
//         res.status(200).json({ success: "false", message: message.CREATE_FAILD("Medicines") });
//       }

//     } else {
//       res.status(200).json({ success: "false", message: message.DATA_EXIST("Medicines") });
//     }

//   } catch (error) {
//     res.status(200).json({ success: " false", message: error.message });
//   }
// }

// edit medicines by id
exports.updateMedicinesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const slug = req.params.slug
    const user = await commonServices.get(Medicines, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Medicines") });
    }
    const id = user.id;

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Medicines, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This Medicines") });
    }

    const data = await clinicServices.updateMedicines({ adminId, id, ...req.body })
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Medicines") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Medicines") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete medicines by id
exports.deleteMedicinesById = async (req, res) => {
  try {

    const slug = req.params.slug
    const user = await commonServices.get(Medicines, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Medicines") });
    }
    const id = user.id;

    let data = await commonServices.delete(Medicines, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Medicines") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_DELETED("Medicines") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view medicines by id
exports.viewMedicinesById = async (req, res) => {

  try {
    const slug = req.params.slug;
    const user = await commonServices.get(Medicines, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Medicines") });
    }
    const id = user.id;

    const data = await clinicServices.viewMedicineById({ id })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Medicines"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This Medicines") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all medicines
exports.viewAllMedicines = async (req, res) => {
  try {

    const { page, size, s } = req.query;
    let data = await clinicServices.getAllMedicines({ page, size, s })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Medicines"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This Medicines") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

