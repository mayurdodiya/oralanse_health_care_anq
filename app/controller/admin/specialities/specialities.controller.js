const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const moment = require("moment");
const Op = db.Sequelize.Op;
const options = require("../../../config/options");


const User = db.users
const Treatment = db.treatments;
const Specialities = db.specialities;





// add specialists
exports.addSpecialists = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(Specialities, query);

    if (isExistingData == null) {
      if (req.body.parent_specialist_id == null) {

        let obj = {
          name: req.body.name,
          image_path: req.body.image_path,
          keywords: req.body.keywords,
          description: req.body.description,
          alternative_name: req.body.alternative_name,
          is_active: true,
          parent_specialist_id: null,
          createdBy: adminId
        }
        const data = await commonServices.create(Specialities, obj)
        if (data) {
          res.status(200).json({
            success: "true",
            message: message.ADD_DATA("Specialities"),
          })
        } else {
          return res.status(200).json({ success: "false", message: message.CREATE_FAILD("Specialities") });
        }
      } else {
        let query = { where: { id: req.body.parent_specialist_id } };
        let isParent = await commonServices.get(Specialities, query)

        if (isParent.parent_specialist_id == null) {
          let obj = {
            name: req.body.name,
            image_path: req.body.image_path,
            keywords: req.body.keywords,
            description: req.body.description,
            alternative_name: req.body.alternative_name,
            is_active: true,
            parent_specialist_id: req.body.parent_specialist_id,
            createdBy: adminId

          }
          const data = await commonServices.create(Specialities, obj)
          if (data) {
            res.status(200).json({
              success: "true",
              message: message.ADD_DATA("Specialities"),
            })
          } else {
            res.status(200).json({ success: "false", message: message.CREATE_FAILD("Specialities") });
          }
        } else {
          res.status(200).json({ success: "false", message: message.NO_DATA("Parent speciality") });
        }
      }
    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Specialities") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit specialists by id
exports.updateSpecialistsById = async (req, res) => {

  try {
    const adminId = req.user.id;
    const id = req.params.id;

    let query = { where: [{ id: { [Op.ne]: req.params.id } }, { name: req.body.name }] }
    let isExist = await commonServices.get(Specialities, query)

    if (isExist == null) {
      let obj = {
        name: req.body.name,
        image_path: req.body.image_path,
        keywords: req.body.keywords,
        description: req.body.description,
        alternative_name: req.body.alternative_name,
        updatedBy: adminId
      }
      let updateSpecialists = await commonServices.update(Specialities, { where: { id: req.params.id } }, obj);
      if (updateSpecialists == 1) {
        res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Specialities") })
      } else {
        res.status(200).json({ success: "false", message: message.NOT_UPDATE("Specialities") })
      }
    } else {
      res.status(200).json({ success: "false", message: message.EXIST("Specialities") })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// delete specialists by id
exports.deleteSpecialistsById = async (req, res) => {
  {
    try {

      let isExist = await commonServices.get(Specialities, { where: { id: req.params.id } });
      if (!isExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Specialities") });
      }

      let isDataExist = await commonServices.get(Specialities, { where: { parent_specialist_id: req.params.id } });
      if (isDataExist) {
        // delete with child and parent
        const t = await db.sequelize.transaction();
        try {

          let user = await contentServices.deleteSpeciality({ id: req.params.id, }, t)
          return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Specialities") })

        } catch (error) {
          await t.rollback();
          res.status(200).json({ success: " false", message: error.message });
        }

      } else {
        // delete only parent no child
        const t = await db.sequelize.transaction();
        try {

          let deleteSpecialities = await commonServices.delete(Specialities, { where: { id: req.params.id } }, t)
          if (!deleteSpecialities) {
            await t.rollback()
            return false
          }

          const deleteTreatment = await commonServices.delete(Treatment, { where: { speciality_id: req.params.id } }, t)
          return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Specialities") })

        } catch (error) {
          await t.rollback();
          res.status(200).json({ success: " false", message: error.message });
        }
      }
    } catch (error) {
      res.status(200).json({ success: " false", message: error.message });
    }
  }
};

// view specialists by id
exports.viewSpecialistsById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'image_path', 'parent_specialist_id', 'keywords', 'description', 'alternative_name'],
      include: [
        { model: Specialities, as: "specialitiesData", required: false, attributes: ['id', 'name', 'image_path', 'parent_specialist_id', 'keywords', 'description', 'alternative_name'] },
      ]
    };
    let data = await commonServices.get(Specialities, query)

    if (data) {

      res.status(200).json({ success: "true", message: message.GET_DATA("Specialities"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("Specialities") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all specialists
exports.viewAllSpecialists = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { parent_specialist_id: { [Op.like]: `%${s}%` } },
          { name: { [Op.like]: `%${s}%` } },
          { keywords: { [Op.like]: `%${s}%` } },
          { alternative_name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ['id', 'name', 'image_path', 'parent_specialist_id', 'keywords', 'description', 'alternative_name', 'createdAt'],
      include: [
        { model: Specialities, as: "specialitiesData", required: false, attributes: ['id', 'name'] },
      ]
    };

    let data = await commonServices.getAndCountAll(Specialities, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      responseData.data.map(item => {
        item.keywords = JSON.parse(item.keywords)
        item.alternative_name = JSON.parse(item.alternative_name)
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Specialities"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Specialities") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// active specialists status
exports.updateSpecialistsStatus = async (req, res) => {
  try {

    const id = req.params.id;
    const user = await commonServices.get(Specialities, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Specialities") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      const data = await commonServices.getAll(Specialities, { where: { parent_specialist_id: id } })
      if (data) {
        const t = await db.sequelize.transaction()
        try {
          await contentServices.changeSpecialityStatus(id, status, t);
          await contentServices.changeSpecialityChildStatus(data, status, t);
          return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Specialities") });
        } catch (error) {
          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message });
        }
      } else {
        await contentServices.changeSpecialityStatus(id, status, t);
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Specialities") });
      }
    } else {
      const status = true
      const data = await commonServices.getAll(Specialities, { where: { parent_specialist_id: id } })
      if (data) {
        const t = await db.sequelize.transaction()
        try {
          await contentServices.changeSpecialityStatus(id, status, t);
          await contentServices.changeSpecialityChildStatus(data, status, t);
          return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Specialities") });
        } catch (error) {

          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message });
        }
      } else {
        await contentServices.changeSpecialityStatus(id, status, t);
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Specialities") });
      }
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};