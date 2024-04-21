const db = require('../models');
const Razorpay = require('razorpay');
const { methods: commonServices } = require("../services/common")
const options = require("../config/options")
const message = require("./message");
const crypto = require("crypto");
const moment = require("moment");
var paypal = require('paypal-rest-sdk');
const axios = require("axios")
const Op = db.Sequelize.Op;

const User = db.users;
const EcomProduct = db.ecom_products;
const EcomProductCategory = db.ecom_product_categories;
const Media = db.medias;
const EcomAddress = db.ecom_addresses;
const Area = db.areas;
const City = db.cities;
const EcomOrder = db.orders;
const EcomOrderDetail = db.order_details;
const AppointmentOrder = db.appointment_orders;
const Transaction = db.transactions;
const Setting = db.settings;
const Promocode = db.promocods;
const OrderLogs = db.order_logs;
const Carts = db.carts;

const generatePaypalAccessToken = async () => {
  try {
    const paypalKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_KEY, is_active: true } })
    const paypalSecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_SECRET, is_active: true } })

    if (!paypalKey.value || !paypalSecret.value) {
      return false
    }
    const auth = Buffer.from(
      paypalKey.value + ":" + paypalSecret.value,
    ).toString("base64");
    const response = await axios.post(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

    const data = await response.data;
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    throw error
  }
};

const methods = {
  getProductCategoryList: async (data) => {
    try {
      let DataObj = {};
      if (data.s) {
        DataObj = {
          ...DataObj,
          [Op.or]: [
            { name: { [Op.like]: `%${data.s}%` } },
            { slug: { [Op.like]: `%${data.s}%` } }
          ]
        }
      }
      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const categoryData = await commonServices.getAndCountAll(EcomProductCategory, { where: [DataObj, { category_type: data.categoryType }], attributes: ["id", "name", "image_path", "slug"], order: [["createdAt", "DESC"]] }, limit, offset)
      const responseData = commonServices.getPagingData(categoryData, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response;
    } catch (error) {
      throw error
    }
  },
  getTrendingProducts: async (data) => {
    try {
      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const productData = await commonServices.getAndCountAll(EcomProduct,
        {
          where: { is_trending: true },
          attributes: ["id", "name", "slug", "price", "description"],
          order: [["createdAt", "DESC"]],
          include: [
            { model: EcomProductCategory, as: "product_categories", attributes: [], where: { category_type: data.categoryType } },
            { model: Media, as: "media", attributes: ["id", "image_url"], limit: 1 }
          ]
        }, limit, offset)
      const responseData = commonServices.getPagingData(productData, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response
    } catch (error) {
      throw error
    }
  },
  getProductListByCategory: async (data) => {
    try {

      var searchData = {};
      if (data.search) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { 'name': { [Op.like]: `%${data.search}%` } },
            { 'price': { [Op.like]: `%${data.search}%` } },
            { 'stock': { [Op.like]: `%${data.search}%` } },
          ]
        }
      }
      const objWhere = {}
      if (data.trending == "trending") {
        objWhere.is_trending = true
      }
      var pricequery = {}
      if (data.price != "") {
        var pricequery = data.price ? { 'price': { [Op.between]: `${data.price}`.split("-") } } : "";
      }
      if (data.sort == "high") {
        var orderData = [["price", "DESC"]]
      }
      if (data.sort == "low") {
        var orderData = [["price", "ASC"]]
      }
      if (data.sort == "any") {
        var orderData = [["id", "DESC"]]
      }
      if (data.sort == "A-Z") {
        var orderData = [["name", "ASC"]]
      }
      if (data.sort == "Z-A") {
        var orderData = [["name", "DESC"]]
      }
      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const productData = await commonServices.getAndCountAll(EcomProduct, {
        where: { category_id: data.categoryId, ...searchData, ...pricequery, ...objWhere },
        attributes: ["id", "name", "slug", "price", "stock", "description"],
        order: orderData,
        include: [
          { model: Media, as: "media", attributes: ["id", "image_url"], limit: 1 }
        ]
      }, limit, offset)
      const responseData = commonServices.getPagingData(productData, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response
    } catch (error) {

      throw error
    }
  },
  viewProductById: async (data) => {
    try {
      const productData = await commonServices.get(EcomProduct,
        {
          where: { slug: data.productSlug },
          attributes: ["id", "category_id", "name", "description", "price", "stock", "is_trending", "meta_title", "meta_description", "meta_keywords", "createdAt"],
          include: [
            { model: EcomProductCategory, as: "product_categories", attributes: ["id", "name"] },
            { model: Media, as: "media", attributes: ["id", "image_url"] }
          ]
        })
      const response = JSON.parse(JSON.stringify(productData))
      return response
    } catch (error) {
      throw error
    }
  },
  viewAllProduct: async (data) => {
    try {
      var searchData = {};
      if (data.s) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { 'name': { [Op.like]: `%${data.s}%` } },
            { 'price': { [Op.like]: `%${data.s}%` } }
          ]
        }
      }
      var pricequery = {}
      if (data.price != "") {
        var pricequery = data.price ? { 'price': { [Op.between]: `${data.price}`.split("-") } } : "";
      }

      const { limit, offset } = commonServices.getPagination(data.page, data.size)
      const productData = await commonServices.getAndCountAll(EcomProduct,
        {
          where: { ...pricequery, ...searchData },
          attributes: ["id", "name", "slug", "price", "description", "stock",],
          include: [
            { model: Media, as: 'medias', attributes: ['id', 'image_url'] }
          ]
        }, limit, offset)
      const responseData = commonServices.getPagingData(productData, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response
    } catch (error) {
      throw error
    }
  },
  viewAllMarketingProduct: async (data) => {
    try {
      var searchData = {};
      if (data.s) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { 'name': { [Op.like]: `%${data.s}%` } },
            { 'price': { [Op.like]: `%${data.s}%` } }
          ]
        }
      }
      var pricequery = {}
      if (data.price != "") {
        var pricequery = data.price ? { 'price': { [Op.between]: `${data.price}`.split("-") } } : "";
      }

      const { limit, offset } = commonServices.getPagination(data.page, data.size)
      const productData = await commonServices.getAndCountAll(EcomProduct,
        {
          where: [{ ...pricequery, ...searchData }, { is_marketing: true }],
          attributes: ["id", "name", "slug", "price", "stock", "description", "marketing_duration"],
          include: [
            { model: Media, as: 'medias', attributes: ['id', 'image_url'] }
          ]
        }, limit, offset)
      const responseData = commonServices.getPagingData(productData, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response
    } catch (error) {
      throw error
    }
  },
  viewOrderDetailsById: async (data) => {
    try {
      const query = {
        where: { id: data.id },
        attributes: ['ecom_address_id', 'order_number', 'payment_method', 'sub_total', 'discount', 'coupon_code', 'net_total', 'createdAt'],
        include: [
          {
            model: EcomOrderDetail, as: "orderDetails", attributes: ['order_id', 'product_id', 'quantity', 'price', 'status'],
            include: [
              {
                model: EcomProduct, as: "ecom_products", attributes: ['name', 'price'],
                include: [
                  { model: Media, as: "medias", attributes: ['image_url'], }
                ]
              },
              { model: OrderLogs, as: "orderLog", attributes: ["id", "order_detail_id", "status", "createdBy", "createdAt"] }
            ]
          },
          { model: EcomAddress, as: "order_addresses", attributes: ['full_name', 'email', 'phone_no', 'address_line_1', 'address_line_2', 'pincode'] },
          { model: Transaction, as: "ecomTransaction", required: false, attributes: ['payment_id'] },

        ]
      }
      const orderDetail = await commonServices.get(EcomOrder, query);
      const response = JSON.parse(JSON.stringify(orderDetail))
      return response
    } catch (error) {
      throw error
    }
  },
  getUserEcomAddressList: async (data) => {
    try {
      const ecomAddress = await commonServices.getAll(EcomAddress,
        {
          where: { user_id: data.userId },
          order: [["id", "DESC"]],
          attributes: ["id", "user_id", "full_name", "email", "phone_no", "address_line_1", "address_line_2", "address_type", "pincode", "city", "state", "country"]
        })
      return ecomAddress
    } catch (error) {
      throw error
    }
  },
  addUserEcomAddress: async (data) => {
    try {
      const cityName = await commonServices.get(Area, { where: { pincode: data.pincode }, include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }] })
      const ecomAddress = await commonServices.create(EcomAddress, {
        user_id: data.userId,
        city: cityName.cities.city_name,
        state: cityName.cities.state_name,
        country: cityName.cities.country_name,
        ...data
      })
      return ecomAddress;
    } catch (error) {
      throw error
    }
  },
  viewUserEcomAddress: async (data) => {
    try {
      const ecomAddress = await commonServices.get(EcomAddress,
        {
          where: { id: data.addressId },
          attributes: { exclude: ["deletedAt", "createdAt", "updatedAt"] }
        })
      return ecomAddress
    } catch (error) {
      throw error
    }
  },
  editUserEcomAddresses: async (data) => {
    try {
      const cityName = await commonServices.get(Area, { where: { pincode: data.pincode }, include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }] })
      const ecomAddress = await commonServices.update(EcomAddress, { where: { id: data.addressId } }, {
        city: cityName.cities.city_name,
        state: cityName.cities.state_name,
        country: cityName.cities.country_name,
        ...data
      })
      return ecomAddress;
    } catch (error) {
      throw error
    }
  },
  calculateConsultationAmount: async (data) => {
    try {
      const consultationFee = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.CONSULT_FEE } })
      const adminFee = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.ADMIN_FEE } })

      const consultationAmount = parseFloat(consultationFee.value);
      const adminAmount = parseFloat(adminFee.value);
      const discountAmount = consultationAmount * (data.discountValue / 100)
      // const finalAmount = consultationAmount - discountAmount + adminAmount
      const finalAmount = consultationAmount - discountAmount
      const payableAmount = finalAmount
      return parseFloat(payableAmount.toFixed(2))
    } catch (error) {
      return error
    }
  },
  // checkCouponApply: async (res, data) => {
  //   try {
  //     const checkCouponCode = await commonServices.get(Promocode, { where: { coupon_code: data.coupon_code, is_active: true } })
  //     if (!checkCouponCode) {
  //       return res.status(200).json({ success: "false", message: message.NO_DATA("Coupon Code") })
  //     }
  //     const discountValue = parseFloat(checkCouponCode.percentage)
  //     const orderData = await commonServices.get(EcomOrder, { where: { user_id: data.userId, coupon_code: data.coupon_code } })
  //     if (orderData) {
  //       return res.status(200).json({ success: "false", message: message.VALIDATE_COUPON })
  //     }
  //     const appointmentOrderData = await commonServices.get(AppointmentOrder, { where: { user_id: data.userId, coupon_code: data.coupon_code } })
  //     if (appointmentOrderData) {
  //       return res.status(200).json({ success: "false", message: message.VALIDATE_COUPON })
  //     }
  //     const transactionData = await commonServices.get(Transaction, { where: { user_id: data.userId, coupon_code: data.coupon_code } })
  //     if (transactionData) {
  //       return res.status(200).json({ success: "false", message: message.VALIDATE_COUPON })
  //     }
  //     return discountValue
  //   } catch (error) {
  //     return error
  //   }
  // },
  checkCouponApply: async (res, data) => {
    try {
      const orderData = await commonServices.get(EcomOrder, { where: { user_id: data.userId, coupon_code: data.coupon_code } })
      if (orderData) {
        return false
      } else {
        const appointmentOrderData = await commonServices.get(AppointmentOrder, { where: { user_id: data.userId, coupon_code: data.coupon_code } })
        if (appointmentOrderData) {
          return false
        } else {
          const transactionData = await commonServices.get(Transaction, { where: { user_id: data.userId, coupon_code: data.coupon_code } })
          if (transactionData) {
            return false
          } else {
            return true
          }
        }
      }
    } catch (error) {
      return error
    }
  },
  createRazorPayOrder: async (amount, currency, receipt) => {
    const razorPayOptions = { amount: amount, currency, receipt };
    try {
      const razorpayKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_KEY, is_active: true } })
      const razorpaySecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_SECRET, is_active: true } })
      var razorpayInstance = new Razorpay({
        key_id: razorpayKey.value,
        key_secret: razorpaySecret.value
      });
      const order = await razorpayInstance.orders.create(razorPayOptions);
      return order;
    } catch (error) {
      throw error;
    }
  },
  verifyRazorpayOrder: async (req, data) => {
    try {
      const razorpaySecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_SECRET, is_active: true } })
      const razorpay_signature = req.headers['x-razorpay-signature'];
      const key_secret = razorpaySecret.value;
      let hmac = crypto.createHmac('sha256', key_secret);
      hmac.update(data.order_id + "|" + data.payment_id);
      const generated_signature = hmac.digest('hex');
      if (razorpay_signature === generated_signature) {
        return true
      } else {
        return false
      }
    } catch (error) {
      return error
    }
  },
  cancelRazorPayOrder: async (data) => {
    const razorPayOptions = { amount: data.amount, receipt: data.receipt };
    try {
      const razorpayKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_KEY, is_active: true } })
      const razorpaySecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.RZP_TEST_SECRET, is_active: true } })
      var razorpayInstance = new Razorpay({
        key_id: razorpayKey.value,
        key_secret: razorpaySecret.value
      });
      const razorpayResponse = await razorpayInstance.payments.refund(data.payment_id, razorPayOptions);
      return razorpayResponse;
    } catch (error) {
      throw error;
    }
  },
  // createPaypalPayment: async (data) => {
  //   try {
  //     const paypalKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_KEY, is_active: true } })
  //     const paypalSecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_SECRET, is_active: true } })
  //     return new Promise((resolve, reject) => {
  //       paypal.configure({
  //         'mode': 'sandbox',
  //         'client_id': paypalKey.value,
  //         'client_secret': paypalSecret.value
  //       });
  //       const create_payment_json = {
  //         "intent": "sale",
  //         "payer": {
  //           "payment_method": "paypal"
  //         },
  //         "redirect_urls": {
  //           "return_url": data.return_url,
  //           "cancel_url": data.cancel_url
  //         },
  //         "transactions": [{
  //           "amount": {
  //             "currency": "USD",
  //             "total": data.amount
  //           },
  //           "description": data.description
  //         }]
  //       };
  //       paypal.payment.create(create_payment_json, (error, payment) => {
  //         if (error) {
  //           reject(error);
  //         } else {
  //           resolve(payment);
  //         }
  //       });
  //     });
  //   } catch (error) {
  //     throw error
  //   }
  // },
  createPaypalPayment: async (data) => {
    try {
      const accessToken = await generatePaypalAccessToken();
      const url = `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`;
      const payload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: data.amount
            },
          },
        ],
      };

      const response = await axios.post(url, payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

      const respData = await response.data;
      return respData;
    } catch (error) {
      throw error
    }
  },
  // executePaypalPayment: async (data) => {
  //   try {
  //     const execute_payment_json = {
  //       payer_id: data.payerId
  //     };
  //     paypal.payment.execute(data.payment_id, execute_payment_json, (error, payment) => {
  //       if (error) {
  //         return false
  //       } else {

  //         return true
  //       }
  //     });
  //   } catch (error) {
  //     throw error
  //   }
  // },
  executePaypalPayment: async (data) => {
    try {
      const accessToken = await generatePaypalAccessToken();
      const url = `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${data.order_id}/capture`;;

      const response = await axios.post(url, null,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

      const respData = await response.data;
      return respData;
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  verifyMobilePaypalMayment: async (data) => {
    try {
      const paypalKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_KEY, is_active: true } })
      const paypalSecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_SECRET, is_active: true } })
      return new Promise((resolve, reject) => {
        paypal.configure({
          'mode': 'sandbox',
          'client_id': paypalKey.value,
          'client_secret': paypalSecret.value
        });
        paypal.payment.get(data.paymentId, (error, payment) => {
          if (error) {
            reject(error);
          } else {
            resolve(payment);
          }
        });
      });
    } catch (error) {
      throw error
    }
  },
  cancelPayPalOrder: async (data) => {
    try {
      const paypalKey = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_KEY, is_active: true } })
      const paypalSecret = await commonServices.get(Setting, { where: { group: options.settingGroup.PAYMENT_GATEWAY, s_key: options.settingKey.PYL_TEST_SECRET, is_active: true } })
      return new Promise((resolve, reject) => {
        paypal.configure({
          'mode': 'sandbox',
          'client_id': paypalKey.value,
          'client_secret': paypalSecret.value
        });
        const refundRequest = {
          amount: {
            total: data.amount,
            currency: 'USD', // Change to the appropriate currency if necessary
          },
        };
        paypal.sale.refund(data.paymentId, refundRequest, (error, refund) => {
          if (error) {
            reject(error);
          } else {
            resolve(refund);
          }
        });
      });
    } catch (error) {
      throw error
    }
  },
  createUserOrder: async (req, data) => {
    const t = await db.sequelize.transaction();
    try {
      const ecomOrder = await commonServices.create(EcomOrder, {
        user_id: data.userId,
        category_type: data.categoryType || options.categoryType.PATIENT,
        order_number: data.orderId,
        payment_method: req.query.type,
        payment_type: options.paymentType.DEBIT,
        txn_type: data.txn_type,
        createdBy: data.userId,
        ...req.body,
      }, { transaction: t })
      if (!ecomOrder) {
        await t.rollback()
        return false
      }

      const cartDetail = req.body.cart_data.map(i => {
        return {
          order_id: ecomOrder.id,
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price
        }
      })
      const ecomOrderDetail = await commonServices.bulkCreate(EcomOrderDetail, cartDetail, { transaction: t })
      const orderLogObj = ecomOrderDetail.map(i => {
        return {
          order_detail_id: i.id,
          status: options.ecomOrderStatus.INPROGRESS,
          createdBy: data.userId,
          updatedBy: data.userId
        }
      })
      const orderLogs = await commonServices.bulkCreate(OrderLogs, orderLogObj, { transaction: t })
      await t.commit()
      return ecomOrder
    } catch (error) {
      await t.rollback()
      return error
    }
  },
  createTransaction: async (data) => {
    try {
      const ecomTransaction = await commonServices.create(Transaction, {
        user_id: data.userId,
        order_id: data.order_id || `order_${commonServices.generateUniqueId(14)}`,
        payment_id: data.payment_id,
        payment_method: data.paymentMethod,
        payment_type: data.paymentType,
        txn_type: data.txnType,
        amount: data.amount,
        status: options.transactionStatus.SUCCESS,
        remarks: message.TRANSACTION_SUCCESS("The payment"),
        txn_id: data.txn_id
      })
      return ecomTransaction;
    } catch (error) {
      return error
    }
  },
  getMyOrderList: async (data) => {
    try {
      var searchData = {};
      if (data.search) {
        searchData = {
          ...searchData,
          [Op.or]: [
            { 'order_number': { [Op.like]: `%${s}%` } },
            { 'payment_method': { [Op.like]: `%${s}%` } },
            { '$orderDetails.quantity$': { [Op.like]: `%${s}%` } },
            { '$orderDetails.status$': { [Op.like]: `%${s}%` } },
            { '$orderDetails.ecom_products.name$': { [Op.like]: `%${s}%` } },
          ]
        }
      }
      const { limit, offset } = commonServices.getPagination(data.page, data.size);
      const getAllOrders = await commonServices.getAndCountAll(EcomOrder,
        {
          where: { user_id: data.userId, ...searchData, txn_type: options.txnType.ECOM },
          order: [["id", "DESC"]],
          distinct: true,
          attributes: ["id", "order_number", "payment_method", "net_total", "createdAt"],
          include: [{
            model: EcomOrderDetail, as: "orderDetails", required: true, attributes: ["id", "quantity", "price", "status"],
            include: [{ model: EcomProduct, as: "ecom_products", attributes: ["id", "name", "description"], include: [{ model: Media, as: "media", attributes: ["image_url"] }] }]
          },
          { model: Transaction, as: "ecomTransaction", attributes: ["payment_id"] }]
        }, limit, offset)
      const responseData = commonServices.getPagingData(getAllOrders, data.page, limit);
      const response = JSON.parse(JSON.stringify(responseData))
      return response;
    } catch (error) {
      return error
    }
  },
  viewOrderById: async (data) => {
    try {
      const orderData = await commonServices.get(EcomOrder,
        {
          where: { user_id: data.userId, order_number: data.order_num, txn_type: options.txnType.ECOM },
          order: [["id", "DESC"]],
          attributes: ["id", "order_number", "payment_method", "net_total", "createdAt"],
          include: [
            { model: EcomAddress, as: "order_addresses", required: false, attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] } },
            {
              model: EcomOrderDetail, as: "orderDetails", required: true, attributes: ["id", "quantity", "price", "status"],
              include: [{
                model: EcomProduct, as: "ecom_products", attributes: ["id", "name", "slug", "description"],
                include: [{ model: Media, as: "media", attributes: ["image_url"] }]
              }, { model: OrderLogs, as: "orderLog", attributes: ["id", "order_detail_id", "status", "createdBy", "createdAt"] }]
            }, { model: Transaction, as: "ecomTransaction", attributes: ["payment_id"] }]
        })
      return orderData;
    } catch (error) {
      return error
    }
  },
  addEcomProduct: async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const slug = await commonServices.generateSlug(data.name);
      const obj = {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        slug: slug,
        is_trending: data.is_trending,
        is_marketing: data.is_marketing,
        is_active: true,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        createdBy: data.adminId || data.userId
      }
      const addEcomProduct = await commonServices.create(EcomProduct, obj, { transaction: t });
      if (!addEcomProduct) {
        await t.rollback()
        return false
      }

      const mediaArr = data.media.map(i => {
        return {
          ecom_product_id: addEcomProduct.id,
          media_name: options.mediaType.IMAGE,
          image_url: i.image_url,
          createdBy: data.userId,
        }
      })
      const addMedias = await commonServices.bulkCreate(Media, mediaArr, { transaction: t });
      if (!addMedias) {
        await t.rollback()
        return false
      };

      await t.commit();
      return true

    } catch (error) {
      await t.rollback()
      throw error
    }
  },
  updateEcomProduct: async (data) => {
    const t = await db.sequelize.transaction();
    try {
      const obj = {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        is_trending: data.is_trending,
        is_marketing: data.is_marketing,
        is_active: true,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        updatedBy: data.adminId,
      }
      const updateEcomProduct = await commonServices.update(EcomProduct, { where: { id: data.id } }, obj, { transaction: t });
      if (!updateEcomProduct) {
        await t.rollback()
        return false
      }


      if (data.media) {
        for (let j = 0; j < data.media.length; j++) {
          if (data.media[j].is_edit) {
            const mediaArr = {
              ecom_product_id: data.media[j].ecom_product_id,
              image_url: data.media[j].image_url,
              updatedBy: data.adminId
            }
            const updateMedias = await commonServices.update(Media, { where: { id: data.media[j].id } }, mediaArr, { transaction: t })
            if (!updateMedias) {
              await t.rollback()
              return false
            }
          }
        }
      }

      await t.commit();
      return true

    } catch (error) {
      await t.rollback()
      throw error
    }
  },

  addToCartProduct: async (data) => {
    try {

      let addToCartsObj = {
        user_id: data.userId,
        product_id: data.productId,
        quantity: data.quantity,
        price: data.productRegularPrice,
        total_price: data.totalPrice,
        createdBy: data.userId,
      };

      const cartData = await commonServices.create(Carts, addToCartsObj);
      return cartData;

    } catch (error) {
      throw error
    }

  },
  UpdateCartById: async (data) => {
    try {

      let cartsObj = {
        quantity: data.quantity,
        price: data.productRegularPrice,
        total_price: data.totalPrice,
        updatedBy: data.userId,
      };

      const cartData = await commonServices.update(Carts, { where: { id: data.id } }, cartsObj);
      return cartData;

    } catch (error) {
      throw error
    }

  }
}


module.exports = { methods }