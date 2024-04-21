const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require("moment")



// recommended (trending) product listing
exports.getTrendingProductList = async (req, res) => {
  try {
    const { page, size } = req.query;
    const data = await ecommerceService.getTrendingProducts({ page, size, categoryType: options.PortalType.HOSPITAL });
    return res.status(200).json({ success: "true", message: message.GET_DATA("Product categories"), data: data })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// ambulance request listing
exports.getAmbulanceRequestList = async (req, res) => {
  try {
    const status = req.query.status;
    const clinicId = req.user.clinics.id;
    const page = req.query.page;
    const size = req.query.size;

    const response = await contentServices.viewAllAmbulanceRequest({ clinicId, page, size, status })

    return res.status(200).json({ success: "true", message: message.GET_DATA("Ambulance request"), data: response })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};