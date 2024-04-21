const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: consultationServices } = require("../../../../services/consultation");
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const endUserServices = require("../../services");
const emailServices = require("../../../../services/email");
const uploadService = require("../../../../services/uploadFile");
const commonResponse = require("./common.response");
const authServices = require("./service");
const commonConfig = require("../../../../config/common.config");
const message = require("../../message");
const config = require("../../../../config/config.json");
const options = require('../../../../config/options');
const Op = db.Sequelize.Op;
const Razorpay = require('razorpay');
const crypto = require("crypto");
const emailTmplateServices = require("../../../../services/email_template")
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload");

const EcomProductCategories = db.ecom_product_categories;
const EcomProduct = db.ecom_products;
const Orders = db.orders;
const OrderDetails = db.order_details;
const EcomAddresses = db.ecom_addresses;
const Medias = db.medias;
const Transactions = db.transactions;
const Carts = db.carts;
const User = db.users;
const Promocode = db.promocods;


//get all trending product category list (not in use)
exports.getTrandingProductCategoryList = async (req, res) => {
  try {
    const data = await commonServices.getAll(EcomProduct, { where: { is_trending: 1 } })
    const arr = []

    for (let j = 0; j < data.length; j++) {
      if (data[j].is_trending == 1) {
        arr.push(data[j].category_id)
      }
    }

    const removeDuplicates = function (arr) {
      return [...new Set(arr)];
    }
    const arry = removeDuplicates(arr)
    const user = await commonServices.getAll(EcomProductCategories, { where: { id: { [Op.in]: arry } } })

    return res.status(200).json({ success: "true", message: message.GET_LIST("Category"), data: user })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

// recommended (trending) product listing
exports.getTrendingProductList = async (req, res) => {
  try {

    const { page, size } = req.query;
    const data = await ecommerceService.getTrendingProducts({ page, size, categoryType: options.PortalType.DOCTOR });
    return res.status(200).json({ success: "true", message: message.GET_DATA("Product categories"), data: data })

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// only product-category listing and seacrching
exports.getProductCategoryListingSeraching = async (req, res) => {
  try {
    const { page, size, s } = req.query;
    const productData = await ecommerceService.getProductCategoryList({ page, size, s, categoryType: options.PortalType.HOSPITAL }, res)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Product"), data: productData });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// product-category listing dropdown
exports.getProductCategoryListingDropdown = async (req, res) => {
  try {
    const query = {
      where: [{ is_active: true }],
      attributes: ["id", "name", "slug"],
      order: [["createdAt", "DESC"]]
    }
    const responseData = await commonServices.getAll(EcomProductCategories, query)
    const response = JSON.parse(JSON.stringify(responseData))
    return res.status(200).json({ success: "true", message: message.GET_LIST("Product catrgory"), data: response });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//view product list by category id
exports.viewProductListByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categorySlug = req.params.slug;
    const { page, size, s, trending, price, sort } = req.query;
    const categoryId = await commonServices.get(EcomProductCategories, { where: { slug: categorySlug } })
    if (!categoryId) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Category") })
    }
    const productData = await ecommerceService.getProductListByCategory({ categoryId: categoryId.id, page, size, search: s, trending, price, sort }, res)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Product"), data: productData });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

// get all product and filter by name and price
exports.getAllProduct = async (req, res) => {
  try {
    const { page, size, s, price } = req.query;
    const productData = await ecommerceService.viewAllProduct({ s, price, page, size });
    return res.status(200).json({ success: "true", message: message.GET_LIST("Product"), data: productData });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// view all marketing product
exports.getAllMarketingProduct = async (req, res) => {
  try {
    const { page, size, s, price } = req.query;
    const productData = await ecommerceService.viewAllMarketingProduct({ s, price, page, size });
    return res.status(200).json({ success: "true", message: message.GET_LIST("Marketing product"), data: productData });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

//view product detail by id
exports.viewProductById = async (req, res) => {
  try {
    const productSlug = req.params.slug;
    const productData = await ecommerceService.viewProductById({ productSlug })
    return res.status(200).json({ success: "true", message: message.GET_DATA("Product"), data: productData })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// view order detail by id
exports.viewOrderDetailsById = async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const data = await ecommerceService.viewOrderDetailsById({ id })
    return res.status(200).json({ message: message.GET_DATA("Order deteils"), data: data });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    const categoryType = options.categoryType.DOCTOR;

    const netTotal = req.body.net_total
    const receipt = commonServices.generateUniqueId(20);

    const ecomAddress = await commonServices.get(EcomAddresses, { where: { id: req.body.ecom_address_id } })
    if (!ecomAddress) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Address") })
    }
    let razorpayOrder = {}

    if (type == options.paymentMethod.RAZORPAY) {
      const orderData = await ecommerceService.createRazorPayOrder(netTotal, 'INR', receipt)
      if (!orderData) {
        return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
      }
      razorpayOrder = { ...orderData }
    }

    const ecomOrder = await ecommerceService.createUserOrder(req, { txn_type: options.txnType.ECOM, userId, categoryType, orderId: type == options.paymentMethod.RAZORPAY ? razorpayOrder.id : commonServices.generateUniqueId(12) })
    if (!ecomOrder) {
      return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
    }

    const stockData = req.body.cart_data
    stockData.map(async item => {
      const ecomProduct = await commonServices.get(EcomProduct, { where: { id: item.product_id } })
      if (ecomProduct.stock > item.quantity) {
        await commonServices.update(EcomProduct, { where: { id: item.product_id } }, { stock: (ecomProduct.stock - item.quantity) })
      }
    })

    return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your") })
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//verify user order
exports.verifyOrder = async (req, res) => {
  const userId = req.user.id;
  const fullName = req.user.full_name;
  const email = req.user.email;
  const { order_id, payment_id, amount, currency, receipt } = req.body;
  const razorpay_signature = req.headers['x-razorpay-signature'];
  const key_secret = process.env.RZP_KEY_SECRET;

  let hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(order_id + "|" + payment_id);
  const generated_signature = hmac.digest('hex');

  if (razorpay_signature === generated_signature) {
    const ecomTransaction = await ecommerceService.createTransaction({ userId, paymentMethod: options.paymentMethod.RAZORPAY, paymentType: options.paymentType.DEBIT, txnType: options.txnType.PURCHASE, ...req.body })
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

// add shiping address
exports.addShippingAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await ecommerceService.addUserEcomAddress({ userId, ...req.body })
    res.status(200).json({ success: "true", message: message.ADD_DATA("Order address") })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

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
};

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
};

//delete user address by id
exports.deleteUserEcomAddressById = async (req, res) => {
  try {
    const addressId = req.params.id
    const ecomAddressData = await commonServices.delete(EcomAddresses, { where: { id: addressId } })
    if (ecomAddressData != 0) {
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Address") })
    } else {
      return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Address") })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
};

// order listing
exports.orderListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, size } = req.query;
    const { limit, offset } = commonServices.getPagination(page, size)
    const data = await commonServices.getAndCountAll(Orders, {
      where: { user_id: userId }, attributes: ['id', 'user_id', 'createdAt'],
      include: [
        {
          model: OrderDetails, as: "orderDetails", attributes: ['order_id', 'product_id', 'status'],
          include: [
            {
              model: EcomProduct, as: "ecom_products", attributes: ['name', 'price'],
              include: [
                { model: Medias, as: "medias", attributes: ['image_url'], }
              ]
            }
          ]
        }
      ]
    })
    const responseData = commonServices.getPagingData(data, page, limit, offset);
    const modifyOrderRes = await commonResponse.modifyOrderRes(responseData)
    res.status(200).json({ success: "true", message: message.GET_DATA("Order"), data: modifyOrderRes });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

// Shipping address listing
exports.shippingAddressListing = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await ecommerceService.getUserEcomAddressList({ userId })
    res.status(200).json({ success: "true", message: message.GET_DATA("Order"), data: data });
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.body.product_id;
    const quantity = req.body.quantity;

    const isExist = await commonServices.get(Carts, { where: [{ user_id: userId }, { product_id: productId }] })
    if (isExist) {
      return res.status(200).json({ success: "false", message: "This product already in your cart!" })
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
      attributes: ['id', 'user_id', 'product_id', 'quantity', 'price', 'total_price'],
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
      message: 'Order summary generated successfully!',
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