const db = require("../../../models");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const commonResponse = require("./common.response");
const message = require("../message");
const commonConfig = require("../../../config/common.config");
const config = require("../../../config/config.json");
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;


const Specialities = db.specialities;
const Treatments = db.treatments;
const User = db.users;



// add treatment
exports.addTreatment = async (req, res) => {

  try {
    const adminId = req.user.id;
    const user = await commonServices.get(Specialities, { where: { id: req.body.speciality_id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This speciality") });
    }

    const query = { where: [{ name: req.body.name }, { speciality_id: req.body.speciality_id }] };
    let isExisting = await commonServices.get(Treatments, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This treatment") });
    }

    let obj = {
      name: req.body.name,
      speciality_id: req.body.speciality_id,
      image_path: req.body.image_path,
      description: req.body.description,
      createdBy: adminId,
    }
    let data = await commonServices.create(Treatments, obj);
    if (data) {
      res.status(200).json({
        success: "true",
        message: message.ADD_DATA("Treatment"),
        data: commonResponse.logInRes(data.name, data.speciality_id, data.image_path)
      })
    } else {
      res.status(200).json({ success: "false", message: message.CREATE_FAILD("Treatment") });
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};

// edit treatment by id
exports.updateTreatmentById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const userData = await commonServices.get(Treatments, { where: { id: req.params.id } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This Treatment") });
    }

    const user = await commonServices.get(Specialities, { where: { id: req.body.speciality_id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This speciality") });
    }

    const id = user.id
    const query = { where: [{ name: req.body.name }, { speciality_id: req.body.speciality_id }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Treatments, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This treatment") });
    }

    const obj = {
      name: req.body.name,
      speciality_id: req.body.speciality_id,
      description: req.body.description,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Treatments, { where: { id: req.params.id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Treatment"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Treatment"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete treatment by id
exports.deleteTreatmentById = async (req, res) => {

  try {
    const adminId = req.user.id;
    const roleId = req.user.role_id;
    const Id = req.params.id;

    let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
    let Admin = await commonServices.get(User, query)
    if (Admin) {

      let deleteServices = await commonServices.delete(Treatments, { where: { id: Id } });
      if (deleteServices) {
        res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Treament"), });
      } else {
        res.status(200).json({ success: "true", message: message.NOT_DELETED("Treament"), });
      }
    } else {
      res.status(200).json({ success: "false", message: message.NOT_USER })
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message })
  }

};


// view treatment by id
exports.viewTreatmentById = async (req, res) => {
  try {
    const id = req.params.id;
    const query = {
      where: { id: id }, attributes: ["id", "name", "speciality_id", "image_path", "description"],
      include: [
        { model: Specialities, as: "specialitydata", attributes: ['id', 'name'] }
      ]
    }

    const data = await commonServices.get(Treatments, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Treatment"), data: data });
    } else {
      res.status(200).json({ success: " false", message: message.NO_DATA("This treatment") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view all treatment
exports.viewAllTreatment = async (req, res) => {
  try {

    const adminId = req.user.id;
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    const query = {
      where: [DataObj],
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ["id", "name", "speciality_id", "image_path"],
      include: [
        { model: Specialities, as: 'specialitydata', attributes: ['name'] }
      ]
    }


    let data = await commonServices.getAndCountAll(Treatments, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Treatment"),
        data: responseData
      });

    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Treatment") })
    }


  } catch (error) {

    res.status(200).json({
      success: " false",
      message: error.message
    })
  }
};

// active user status
exports.updateTreatmentStatus = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await commonServices.get(Treatments, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Treatment") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changeTreatmentStatus(id, status);
      res.status(200).json({ success: "true", message: message.CHANGE_DATA("Treatment status") });
    } else {
      const status = true
      await contentServices.changeTreatmentStatus(id, status);
      res.status(200).json({ success: "true", message: message.CHANGE_DATA_FAILED("Treatment status") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};

// // delete treatment by id
// exports.deleteTreatmentById = async (req, res) => {

//   try {
//     const adminId = req.user.id;
//     const roleId = req.user.role_id;
//     const id = req.params.id;

//     const data = await commonServices.get(Treatments, { where: { id: id } })
//     const specialityId = data.speciality_id;
//     const t = await db.sequelize.transaction()
//     try {

//       let deleteServices = await commonServices.delete(Treatments, { where: { id: id } }, t);
//       let deleteS = await commonServices.delete(Specialities, { where: { id: id } }, t);
//       await t.commit()
//       return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Treament"), });

//     } catch (error) {
//
//       await t.rollback()
//     }

//   } catch (error) {
//
//     res.status(200).json({ success: " false", message: error.message })
//   }

// };