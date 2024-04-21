const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const crypto = require("crypto")
const { methods: commonServices, getUsedRate } = require("../../../../services/common");
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const commonConfig = require("../../../../config/common.config")
const message = require("../../message");
const options = require('../../../../config/options');
const emailTmplateServices = require("../../../../services/email_template")
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");

const EcomProduct = db.ecom_products;
const EcomOrderDetails = db.order_details;
const EcomAddress = db.ecom_addresses;
const Orders = db.orders;
const User = db.users;
const Setting = db.settings;
const Promocode = db.promocods;
const OrderLogs = db.order_logs;
const Medias = db.medias;
const Carts = db.carts;
const EcomProductCategory = db.ecom_product_categories;


//create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, deviceType } = req.query;
    const { coupon_code, net_total } = req.body
    const receipt = commonServices.generateUniqueId(20);
    if (typeof coupon_code === 'string' && coupon_code.length !== 0) {
      const checkCouponNotExist = await ecommerceService.checkCouponApply(res, { coupon_code, userId })
      if (checkCouponNotExist) {
        const checkCouponCode = await commonServices.get(Promocode, { where: { coupon_code: coupon_code, is_active: true } })
        if (!checkCouponCode) {
          return res.status(200).json({ success: "false", message: message.NO_DATA("Coupon Code") })
        }
        discountValue = parseFloat(checkCouponCode.percentage)
      } else {
        return res.status(200).json({ success: "false", message: message.VALIDATE_COUPON })
      }
    }
    const ecomAddress = await commonServices.get(EcomAddress, { where: { id: req.body.ecom_address_id } })
    if (!ecomAddress) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Address") })
    }
    const usdAmount = await getUsedRate()

    let razorpayOrder = {}
    if (type == options.paymentMethod.RAZORPAY) {
      const orderData = await ecommerceService.createRazorPayOrder(net_total * usdAmount, 'INR', receipt)
      if (!orderData) {
        return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
      }
      razorpayOrder = { ...orderData }
    }
    if (type == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.WEB) {
        const orderData = await ecommerceService.createPaypalPayment({ amount: net_total })
        if (!orderData) {
          return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
        }
        razorpayOrder = { ...orderData }
      }
    }
    const ecomOrder = await ecommerceService.createUserOrder(req, { txn_type: options.txnType.ECOM, userId, orderId: type == options.paymentMethod.RAZORPAY ? razorpayOrder.id : `order_${commonServices.generateUniqueId(14)}` })
    if (!ecomOrder) {
      return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
    }
    let stockData = req.body.cart_data
    stockData.map(async item => {
      const ecomProduct = await commonServices.get(EcomProduct, { where: { id: item.product_id } })
      if (ecomProduct.stock > item.quantity) {
        await commonServices.update(EcomProduct, { where: { id: item.product_id } }, { stock: (ecomProduct.stock - item.quantity) })
      }
    })
    return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: ecomOrder })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//verify user order
exports.verifyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const fullName = req.user.full_name;
    const email = req.user.email;
    const { paymentId, type, order_id, deviceType } = req.query
    if (type == options.paymentMethod.RAZORPAY) {
      var verifyPayment = await ecommerceService.verifyRazorpayOrder(req, { order_id, payment_id: paymentId })
      if (verifyPayment === true) {
        const ecomTransaction = await ecommerceService.createTransaction({
          userId,
          paymentMethod: type,
          paymentType: options.paymentType.DEBIT,
          txnType: options.txnType.ECOM,
          payment_id: paymentId,
          ...req.body,
          ...req.query
        })
        if (!ecomTransaction) {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        }

        // for push notification -----------
        const context = await emailTmplateServices.getOrderGenerateContext({ /* full_name: fullName, email: email */ })
        const payload = fcmNotificationPayload.orderGenerated({ userId: userId })
        await sendAllNotification.sendAllNotification({ payload, context, email: email })

        // send to admin ------
        const adminData = await commonServices.get(User, { where: { role_id: 1 } })
        if (adminData != null) {
          const adminEmail = adminData.email;
          const adminUserId = adminData.id;
          const context2 = await emailTmplateServices.getAdminOrderContext({ /* add data as per context need */ })
          const payload2 = fcmNotificationPayload.adminOrders({ userId: adminUserId, body: fullName })
          await sendAllNotification.sendAllNotification({ payload: payload2, context: context2, email: adminEmail })
        }

        return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
      } else {
        return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
      }
    }
    if (type == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.APP) {
        var verifyPayment = await ecommerceService.verifyMobilePaypalMayment({ paymentId })
        var payment_state = verifyPayment.state;
        var transaction_server = verifyPayment.transactions[0];
        var slale_state_server = transaction_server.related_resources[0].sale.state;

        if (slale_state_server !== "completed") {
          return res.status(200).json({ success: "false", message: message.NO_PAYPAL_SALE })
        }
        if (payment_state !== "approved") {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        } else {
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: type,
            paymentType: options.paymentType.DEBIT,
            txnType: options.txnType.ECOM,
            payment_id: paymentId,
            ...req.body,
            ...req.query
          })
          if (!ecomTransaction) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }

          const context = await emailTmplateServices.getOrderGenerateContext({ /* full_name: fullName, email: email */ })
          const payload = fcmNotificationPayload.orderGenerated({ userId: userId })
          await sendAllNotification.sendAllNotification({ payload, context, email: email })

          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        }
      } else if (deviceType == options.deviceType.WEB) {
        var verifyPayment = await ecommerceService.executePaypalPayment({ order_id })
        if (verifyPayment != null) {
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: type,
            paymentType: options.paymentType.DEBIT,
            txnType: options.txnType.ECOM,
            payment_id: paymentId,
            ...req.body,
            ...req.query
          })
          if (!ecomTransaction) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }

          const context = await emailTmplateServices.getOrderGenerateContext({ /* full_name: fullName, email: email */ })
          const payload = fcmNotificationPayload.orderGenerated({ userId: userId })
          await sendAllNotification.sendAllNotification({ payload, context, email: email })

          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        } else {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        }
      } else {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Device type") })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get all order list
exports.getAllOrderList = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size, s } = req.query;
    const orderData = await ecommerceService.getMyOrderList({ userId, search: s, page, size })
    var responseData = JSON.parse(JSON.stringify(orderData))
    responseData.data.map(i => {
      i.createdAt = moment(i.createdAt).format(options.DateFormat.DATE)
    })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Order"), data: responseData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view order by id
exports.viewOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const order_num = req.params.no;
    const orderData = await ecommerceService.viewOrderById({ userId, order_num })
    if (!orderData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Order") })
    }
    return res.status(200).json({ success: "true", message: message.GET_DATA("Order"), data: orderData })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//view single order product by id
exports.viewSingleOrderProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    let query = {
      where: { id: orderId },
      attributes: ['id', 'quantity', 'price', 'status', 'createdAt'],
      include: [
        {
          model: Orders, as: "orders", attributes: ['id', 'user_id', 'order_number', 'payment_method', 'sub_total', 'discount', 'coupon_code', 'net_total'],
          include: [{ model: EcomAddress, as: "order_addresses", attributes: ['id', 'full_name', 'email', 'phone_no', 'address_line_1', 'address_line_2', 'pincode', 'city', 'state', 'country'] }],
          include: [{ model: User, as: "ecomUser", attributes: ["full_name"], }]
        },
        { model: OrderLogs, as: "orderLog", attributes: ["id", "order_detail_id", "status", "createdBy", "createdAt"] },
        { model: EcomProduct, as: "ecom_products", required: false, attributes: ['id', 'name', 'description', 'price'], include: [{ model: Medias, as: "medias", required: false, attributes: ["id", "image_url"] }] },
      ]
    };
    let data = await commonServices.get(EcomOrderDetails, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Order detail"), data: data })
    } else {
      res.status(200).json({ success: "true", message: message.NO_DATA("This order detail"), })
    }

  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.body.product_id;
    const quantity = req.body.quantity;

    const isExist = await commonServices.get(Carts, { where: [{ user_id: userId }, { product_id: productId }] })
    if (isExist) {
      return res.status(200).json({ success: "true", message: "This product already in your cart!" })
    }

    let query = {
      where: { id: productId },
    };

    let getProductDetail = await commonServices.get(EcomProduct, query);
    let productRegularPrice = getProductDetail.price;
    const totalPrice = productRegularPrice * quantity;
    const productCurrentStock = getProductDetail.stock;

    if (quantity > productCurrentStock) {
      return res.status(200).json({ success: "false", message: "Your quantity is out of stock please enter valid quantity!" })
    } else if (productCurrentStock == 0) {
      return res.status(200).json({ success: "false", message: "This product is out of stock!" })
    }

    const cartData = await ecommerceService.addToCartProduct({ userId, totalPrice, productId, quantity, productRegularPrice })

    if (cartData) {
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Cart"), data: cartData })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Cart") })
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.editCartQuantityById = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const quantity = req.body.quantity;

    const isExist = await commonServices.get(Carts, { where: [{ user_id: userId }, { id: id }] })
    if (!isExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This cart") })
    }
    const productId = isExist.product_id;

    let getProductDetail = await commonServices.get(EcomProduct, { where: { id: productId } });
    let productRegularPrice = getProductDetail.price;
    const totalPrice = productRegularPrice * quantity;
    const productCurrentStock = getProductDetail.stock;

    if (quantity > productCurrentStock) {
      return res.status(200).json({ success: "false", message: "Your quantity is out of stock please enter valid quantity!" })
    } else if (productCurrentStock == 0) {
      return res.status(200).json({ success: "false", message: "This product is out of stock!" })
    }

    const cartData = await ecommerceService.UpdateCartById({ id, userId, totalPrice, quantity, productRegularPrice })

    if (cartData) {
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Cart") })
    } else {
      return res.status(200).json({ success: "false", message: message.UPDATE_PROFILE_FAILED("Cart") })
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCartList = async (req, res) => {
  try {
    const userId = req.user.id;
    let query = {
      where: { user_id: userId },
      attributes: ['id', 'user_id', 'product_id', 'quantity', 'price', 'total_price', 'image_path', 'name'],
      include: [
        {
          model: EcomProduct, as: 'cartProducts', attributes: ['name'],
          include: [
            { model: Medias, as: 'media', attributes: ['image_url'], }
          ]
        }
      ]
    };

    let getCartList = await commonServices.getAll(Carts, query);

    const totalPriceSum = getCartList.reduce((acc, item) => acc + item.total_price, 0);

    res.status(200).json({ success: true, message: message.GET_DATA('Cart'), data: getCartList, Subtotal: totalPriceSum });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCartProductById = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.id;
    let query = {
      where: { user_id: userId, product_id: productId }
    };

    let deletedCartItem = await commonServices.delete(Carts, query);

    if (!deletedCartItem) {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED('Cart') });
    }

    res.status(200).json({ success: "true", message: message.DELETE_PROFILE('Cart') });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: "false", message: error.message });
  }
};

exports.OrderSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    let query = {
      where: { user_id: userId },
      attributes: ['user_id', 'product_id', 'quantity', 'price', 'total_price'],
      include: [
        {
          model: EcomProduct, as: 'cartProducts', attributes: ['name'],
          include: [
            { model: Medias, as: 'media', attributes: ['image_url'], }
          ]
        }
      ]
    };

    let getCartList = await commonServices.getAll(Carts, query);

    var totalPriceSum = getCartList.reduce((acc, item) => acc + item.total_price, 0);

    let Ordersquery = {
      where: { user_id: userId },
      attributes: ['user_id', 'coupon_code']
    };

    let isCouponCheck = await commonServices.getAll(Orders, Ordersquery);

    const appliedCouponCodes = isCouponCheck
      .filter(order => order.coupon_code !== null && order.coupon_code !== undefined)
      .map(order => order.coupon_code);

    if (req.params.promo && appliedCouponCodes.includes(req.params.promo)) {
      return res.status(200).json({ success: false, message: 'You have already applied this coupon code' });
    }

    let totalAmount = totalPriceSum;
    let discount = 0;
    let couponDescription = '';

    if (req.params.promo) {
      const couponCode = req.params.promo;

      let couponCodeQuery = {
        where: { coupon_code: couponCode },
        attributes: ['description', 'percentage', 'coupon_code', 'is_active']
      };

      const getCouponCode = await commonServices.get(Promocode, couponCodeQuery);

      if (getCouponCode && getCouponCode.is_active === true) {
        const percentageDiscount = getCouponCode.percentage;
        discount = (totalPriceSum * percentageDiscount) / 100;
        totalPriceSum -= discount;
        couponDescription = getCouponCode.description;
      } else if (getCouponCode && !getCouponCode.is_active) {
        return res.status(200).json({ success: false, message: 'Coupon code is expired' });
      }
    }

    const responseObj = {
      success: true,
      message: 'Order summary generated',
      data: getCartList,
      subTotal: totalAmount,
      netTotal: totalPriceSum,
    };

    if (discount > 0) {
      responseObj.SaveAmount = discount;
      responseObj.CouponDescription = couponDescription;
    }

    res.status(200).json(responseObj);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAllCartlist = async (req, res) => {
  try {
    const userId = req.user.id;
    let query = {
      where: { user_id: userId }
    };

    let deletedCartItem = await commonServices.delete(Carts, query);

    if (!deletedCartItem) {
      return res.status(200).json({ success: false, message: message.DELETE_PROFILE_FAILED('Cart') });
    }

    res.status(200).json({ success: true, message: message.DELETE_PROFILE('Cart') });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};