const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const commonResponse = require("./common.response");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment')

const CoWorkingSpaces = db.co_working_spaces;
const CoWorkingSpaceRequests = db.co_working_space_requests;
const Doctors = db.doctors;


// add co-working spaces
exports.addCoWorkingSpaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const clinicId = req.user.clinics.id;
    const data = await contentServices.addCoWorkingSpaces({ userId, clinicId, ...req.body })
    if (data != null) {
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Co working") })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Co working") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// update co-working spaces
exports.updateCoWorkingSpaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const data = await contentServices.updateCoWorkingSpaces({ userId, id, ...req.body })
    if (data == 1) {
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Co working") })
    } else {
      return res.status(200).json({ success: "false", message: message.UPDATE_PROFILE_FAILED("Co working") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// delete co-working spaces
exports.deleteCoWorkingSpaces = async (req, res) => {
  try {
    const id = req.params.id;
    const isExist = await commonServices.get(CoWorkingSpaces, { where: { id: id } })
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Co working space") })
    }

    const data = await contentServices.deleteCoWorkingSpaces({ id })
    if (data == 1) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Co working") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Co working") })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view co-working space detail by id
exports.viewCoWorkingSpaceDetailById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await contentServices.viewCoWorkingSpaceDetail({ id })
    data.amenities = JSON.parse(data.amenities);
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Co working"), data: data });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Co working") });
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view all co-working spaces
exports.viewAllCoWorkingSpaces = async (req, res) => {
  try {
    const { page, size, s } = req.query;

    const data = await contentServices.viewAllCoWorkingSpaces({ page, size, s })

    const response = JSON.parse(JSON.stringify(data))

    return res.status(200).json({ success: "true", message: message.GET_DATA("Co working"), data: response })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view all co-working spaces request
exports.viewAllCoWorkingSpacesRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const clinicId = req.user.clinics.id;
    const { page, size, s } = req.query

    const data = await contentServices.viewAllCoWorkingSpacesRequest({ id, clinicId, page, size, s })
    const responseData = commonResponse.modifyRequestRes(data)

    return res.status(200).json({
      success: "true", message: message.GET_DATA("Co working space request"),
      data: {
        totalItems: data.totalItems,
        data: responseData,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      }
    })

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view request details by id
exports.viewRequestDetailById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await contentServices.viewCoWorkingSpacesRequestDetail({ id })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Request"), data: data });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Request data") });
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};