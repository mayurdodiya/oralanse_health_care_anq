const db = require("../../../models");
const commonResponse = require('./common.response');
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const uploadService = require("../../../services/uploadFile");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
// const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: ecommerceService } = require("../../../services/ecommerce");
const { methods: contentServices } = require("../../../services/content");
const emailTmplateServices = require("../../../services/email_template")
const sendAllNotification = require("../../../services/settings");
const fcmNotificationPayload = require("../../../services/fcm_notification_payload");
const config = require("../../../config/config.json")
const jwt = require("jsonwebtoken");
const Op = db.Sequelize.Op;


const EcomProducts = db.ecom_products;
const EcomProductCategories = db.ecom_product_categories;
const Orders = db.orders;
const OrderAddresses = db.ecom_addresses;
const OrderDetails = db.order_details;
const Medias = db.medias;
const User = db.users;
const OrderLogs = db.order_logs;



// add product
exports.addEcomProducts = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(EcomProducts, query);

    if (isExistingData == null) {
      const data = await ecommerceService.addEcomProduct({ adminId, ...req.body })
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Product"), })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Product") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Product") });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit product by id
exports.updateEcomProductsById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(EcomProducts, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This product") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(EcomProducts, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This product") });
    }

    const data = await ecommerceService.updateEcomProduct({ id, adminId, ...req.body })
    if (data > 0) {
      res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Product") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Product") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete product by id
exports.deleteEcomProductsById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(EcomProducts, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This product") });
    }


    let data = await commonServices.delete(EcomProducts, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Product"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Product"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view product by id
exports.viewEcomProductsById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'description', 'price', 'stock', 'is_marketing', 'meta_title', 'meta_description', 'meta_keywords', 'is_active'],
      include: [
        { model: EcomProductCategories, as: "product_categories", attributes: ['id', 'name', 'slug', 'meta_title', 'meta_description', 'meta_keywords'] },
        { model: Medias, as: "media", attributes: ["id", "image_url"] }
      ]
    };
    let data = await commonServices.get(EcomProducts, query)

    if (data) {

      res.status(200).json({ success: "true", message: message.GET_DATA("Product"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This product"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all product
exports.viewAllEcomProducts = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { name: { [Op.like]: `%${s}%` } },
          { price: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    let query = {
      where: [DataObj],
      attributes: ['id', 'name', 'description', 'price', 'stock', 'is_marketing', 'meta_title', 'meta_description', 'meta_keywords', 'is_active'],
      include: [
        { model: EcomProductCategories, as: "product_categories", attributes: ['id', 'name', 'slug', 'meta_title', 'meta_description', 'meta_keywords'] },
        { model: Medias, as: "media", attributes: ["id", "image_url"] }
      ]
    };

    let data = await commonServices.getAndCountAll(EcomProducts, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("EcomProducts"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("EcomProducts") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// change product status
exports.changeProductStatus = async (req, res) => {
  try {

    const id = req.params.id;
    const user = await commonServices.get(EcomProducts, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Product") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      const data = await contentServices.changeProductStatus(id, status);
      if (data == false) {
        return res.status(200).json({ success: "false", message: message.STATUS_FAILED("Product") });
      }
      return res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Product") });
    } else {
      const status = true
      const data = await contentServices.changeProductStatus(id, status);
      if (data == false) {
        return res.status(200).json({ success: "false", message: message.STATUS_FAILED("Product") });
      }
      return res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Product") });
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message });
  }
};

// //  view all orders
// exports.viewAllOrders = async (req, res) => {

//   try {
//     const { page, size, s } = req.query;

//     let DataObj = {};
//     if (s) {
//       DataObj = {
//         ...DataObj,
//         [Op.or]: [
//           { id: { [Op.like]: `%${s}%` } },
//           { user_id: { [Op.like]: `%${s}%` } },
//         ]
//       }
//     }

//     const { limit, offset } = commonServices.getPagination(page, size);

//     let query = {
//       where: [DataObj],
//       attributes: ['id', 'user_id', 'order_number', 'payment_method', 'sub_total', 'discount', 'coupon_code', 'net_total'],
//       include: [
//         { model: OrderAddresses, as: "order_addresses", attributes: ['id', 'full_name', 'email', 'phone_no', 'address_line_1', 'address_line_2', 'pincode'] },
//       ]
//     };

//     let data = await commonServices.getAndCountAll(Orders, query, limit, offset)
//     if (data) {
//       const response = commonServices.getPagingData(data, page, limit);
//       let responseData = JSON.parse(JSON.stringify(response))

//       res.status(200).json({ success: "true", message: message.GET_DATA("Orders"), data: responseData })
//     } else {
//       res.status(200).json({ success: "false", message: message.NO_DATA("Orders") })
//     }


//   } catch (error) {
//     res.status(200).json({ success: " false", message: error.message })
//   }

// };

//  view all orders
exports.viewAllOrders = async (req, res) => {

  try {
    const { page, size, s, status } = req.query;
    var statusCondition = status ? { status: status } : ""
    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { "$orders.order_number$": { [Op.like]: `%${s}%` } },
          { "$orders.ecomUser.full_name$": { [Op.like]: `%${s}%` } },
          { "$ecom_products.name$": { [Op.like]: `%${s}%` } },
          { createdAt: { [Op.like]: `%${s}%` } },
          { status: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    let query = {
      where: { ...DataObj, ...statusCondition },
      attributes: ['id', 'order_id', 'product_id', 'quantity', 'price', 'status', 'createdAt'],
      include: [
        {
          model: Orders, as: "orders", attributes: ['id', 'user_id', 'order_number', 'payment_method', 'sub_total', 'discount', 'coupon_code', 'net_total'],
          include: [{ model: User, as: "ecomUser", attributes: ["full_name"] }]
        },
        { model: EcomProducts, as: "ecom_products", required: false, attributes: ['id', 'name', 'description', 'price'], include: [{ model: Medias, as: "medias", required: false, attributes: ["id", "image_url"] }] },
      ]
    };

    let data = await commonServices.getAndCountAll(OrderDetails, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))
      res.status(200).json({ success: "true", message: message.GET_DATA("Orders"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Orders") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

//  view order detail by id
exports.viewOrderDetailById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'order_id', 'product_id', 'quantity', 'price', 'status', 'createdAt'],
      include: [
        {
          model: Orders, as: "orders", attributes: ['id', 'user_id', 'order_number', 'payment_method', 'sub_total', 'discount', 'coupon_code', 'net_total'],
          include: [{ model: OrderAddresses, as: "order_addresses", attributes: ['id', 'full_name', 'email', 'phone_no', 'address_line_1', 'address_line_2', 'pincode', 'city', 'state', 'country'] }],
          include: [{ model: User, as: "ecomUser", attributes: ["full_name"], }]
        },
        { model: OrderLogs, as: "orderLog", attributes: ["id", "order_detail_id", "status", "createdBy", "createdAt"] },
        { model: EcomProducts, as: "ecom_products", required: false, attributes: ['id', 'name', 'description', 'price'], include: [{ model: Medias, as: "medias", required: false, attributes: ["id", "image_url"] }] },
      ]
    };
    let data = await commonServices.get(OrderDetails, query)

    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Order detail"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This order detail"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }

};

// change order status by id
exports.changeOrderStatusById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id;
    var status = req.body.status;
    const orderDetailData = await commonServices.get(OrderDetails, { where: { id: id } })
    if (!orderDetailData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This order detail") });
    }
    const obj = {
      status: status,
      updatedBy: adminId,
    }
    let data = await commonServices.update(OrderDetails, { where: { id: id } }, obj);
    if (data > 0) {
      const orderLogs = await commonServices.create(OrderLogs, { order_detail_id: orderDetailData.id, status: obj.status, createdBy: adminId, updatedBy: adminId })

      // for push notification -----------
      const orderId = orderDetailData.order_id;
      const userData = await commonServices.get(Orders, { where: { id: orderId } })
      const userId = userData.user_id;
      const user = await commonServices.get(User, { where: { id: userId } })
      const email = user.email;
      const context = await emailTmplateServices.getOrderStatusContext({ /* write in body as need for templates */ })
      if (status == "in_progress") {
        status = "in progress"
      }
      if (status == "in_transit") {
        status = "in transit"
      }
      if (status == "delivered") {
        status = "delivered"
      }
      if (status == "cancelled") {
        status = "cancelled"
      }
      const payload = fcmNotificationPayload.orderStatus({ userId: 363, body: status })
      await sendAllNotification.sendAllNotification({ payload, context, email: email })

      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Order detail") });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Order detail status"), });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}
