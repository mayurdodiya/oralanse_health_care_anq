const db = require("../../../../models");
const commonResponse = require('./common.response');
const message = require("../../message");
const { methods: commonServices, pincodeExist } = require('../../../../services/common');
const { methods: contentServices } = require("../../../../services/content");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const options = require("../../../../config/options")


const Doctors = db.doctors;
const ResearchPosts = db.research_posts;
const User = db.users;


// add research post
exports.addResearchPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorId = req.user.doctors.id;

    let obj = {
      doctor_id: doctorId,
      name: req.body.name,
      description: req.body.description,
      image_path: req.body.image_path,
      createdBy: userId
    }

    await commonServices.create(ResearchPosts, obj)
    res.status(200).json({ success: "true", message: message.ADD_DATA("Research posts"), })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit research post by id
exports.updateResearchPostById = async (req, res) => {
  try {

    const userId = req.user.id;
    const id = req.params.id;

    const obj = {
      name: req.body.name,
      description: req.body.description,
      image_path: req.body.image_path,
      updatedBy: userId
    }
    let data = await commonServices.update(ResearchPosts, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Research posts"), });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Research posts"), });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete research post by id
exports.deleteResearchPostById = async (req, res) => {
  try {

    const id = req.params.id
    let data = await commonServices.delete(ResearchPosts, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Research posts"), });
    } else {
      res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Research posts"), });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view research post by id
exports.viewResearchPostById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'doctor_id', 'name', 'description', 'image_path', 'createdAt'],
      include: [
        {
          model: Doctors, as: "doctors", attributes: ['id'],
          include: [
            { model: User, as: "users", attributes: ['full_name'], }
          ]
        }
      ]
    };
    let data = await commonServices.get(ResearchPosts, query)
    const response = JSON.parse(JSON.stringify(data));
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Research posts"), data: response })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("Research posts"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all research post
exports.viewAllResearchPost = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'doctor_id', 'name', 'description', 'image_path', 'createdAt'],
      include: [
        {
          model: Doctors, as: "doctors", attributes: ['id'],
          include: [
            { model: User, as: "users", attributes: ['full_name'], }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    };

    let data = await commonServices.getAndCountAll(ResearchPosts, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = commonResponse.logResponse(response)

      res.status(200).json({ success: "true", message: message.GET_DATA("Research posts"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Research posts") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};