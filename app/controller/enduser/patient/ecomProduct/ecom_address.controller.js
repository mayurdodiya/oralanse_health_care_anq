const db = require("../../../../models");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: ecommerceService } = require("../../../../services/ecommerce")

const message = require("../../message");


const EcomAddress = db.ecom_addresses;


//get all user address list
exports.getUserAddressList = async (req, res) => {
  try {
    const userId = req.user.id;
    const ecomAddress = await ecommerceService.getUserEcomAddressList({ userId })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Address"), data: ecomAddress })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//add user ecom address
exports.addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const pincodeData = await pincodeExist(req.body.pincode)
    if (pincodeData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
    }
    const ecomAddress = await ecommerceService.addUserEcomAddress({ userId, ...req.body })
    return res.status(200).json({ success: "true", message: message.ADD_DATA("Address"), data: ecomAddress })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view user address by id
exports.viewUserAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id
    const ecomAddress = await ecommerceService.viewUserEcomAddress({ addressId })
    if (!ecomAddress) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Address") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Address"), data: ecomAddress })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//edit user address by id
exports.editUserAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id
    const pincodeData = await pincodeExist(req.body.pincode)
    if (pincodeData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
    }
    const ecomAddressData = await ecommerceService.editUserEcomAddresses({ userId, addressId, ...req.body })
    if (ecomAddressData != 0) {
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Address") })
    } else {
      return res.status(200).json({ success: "false", message: message.CHANGE_DATA_FAILED("Address") })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//delete user address by id
exports.deleteUserEcomAddressById = async (req, res) => {
  try {
    const addressId = req.params.id
    const ecomAddressData = await commonServices.delete(EcomAddress, { where: { id: addressId } })
    if (ecomAddressData != 0) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Address") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Address") })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}