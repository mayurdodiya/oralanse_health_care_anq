const db = require("../../../models");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const Op = db.Sequelize.Op;
const message = require("../message");



const Areas = db.areas;
const Cities = db.cities;



// add cities
exports.addCities = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { city_name: req.body.city_name } };
    const isExistingData = await commonServices.get(Cities, query);

    if (isExistingData == null) {

      let obj = {
        city_name: req.body.city_name.toLowerCase(),
        state_name: req.body.state_name.toLowerCase(),
        country_name: req.body.country_name.toLowerCase(),
        createdBy: adminId
      }
      const data = await commonServices.create(Cities, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("City"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("City") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("This city") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit cities by id
exports.updateCitiesById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Cities, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This city") });
    }

    const query = { where: [{ city_name: req.body.city_name }, { id: { [Op.ne]: id } }] };
    let isExisting = await commonServices.get(Cities, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This city") });
    }

    const obj = {
      city_name: req.body.city_name.toLowerCase(),
      state_name: req.body.state_name.toLowerCase(),
      country_name: req.body.country_name.toLowerCase(),
      updatedBy: adminId,
    }
    let data = await commonServices.update(Cities, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("City") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("City") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete cities by id
exports.deleteCitiesById = async (req, res) => {
  {
    try {

      let isExist = await commonServices.get(Cities, { where: { id: req.params.id } });
      if (!isExist) {
        return res.status(200).json({ success: "false", message: message.NO_DATA("City") });
      }

      let isDataExist = await commonServices.get(Areas, { where: { city_id: req.params.id } });
      if (isDataExist) {
        // delete with child and parent
        const t = await db.sequelize.transaction();
        try {
          let user = await contentServices.deleteCity({ id: req.params.id, }, t)
          if (user > 0) {
            res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("City") })
          } else {
            res.status(200).json({ success: "false", message: message.NOT_DELETED("City") });
          }

        } catch (error) {
          await t.rollback();
          res.status(200).json({ success: " false", message: error.message });
        }

      } else {
        // delete only parent no child
        let user = await commonServices.delete(Cities, { where: { id: req.params.id } })
        if (user > 0) {
          res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("City") })
        } else {
          res.status(200).json({ success: "false", message: message.NOT_DELETED("City") });
        }
      }
    } catch (error) {
      res.status(200).json({ success: " false", message: error.message });
    }
  }
};

// view cities by id
exports.viewCitiesById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'city_name', 'state_name', 'country_name', 'createdAt'],
    };
    let data = await commonServices.get(Cities, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("City"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This city"),
      })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all cities
exports.viewAllCities = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { city_name: { [Op.like]: `%${s}%` } },
          { state_name: { [Op.like]: `%${s}%` } },
          { country_name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ['id', 'city_name', 'state_name', 'country_name', 'createdAt'],
    };

    let data = await commonServices.getAndCountAll(Cities, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("City"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This city") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};
