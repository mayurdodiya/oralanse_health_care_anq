const db = require('../../app/models');
const jwt = require('jsonwebtoken');
const config = require("../config/config.json");
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');
const randomString = require('randomstring');
const options = require("../config/options");
var QRCode = require('qrcode')

const User = db.users;
const EnduserAssignRoles = db.enduser_assign_roles;
const Area = db.areas;
const Setting = db.settings;

const pincodeExist = async (pincode) => {
	return await methods.checkFlag(Area, { where: { pincode: pincode } })
		.then((count) => {
			if (count != 0) {
				return false;
			}
			return true;
		});
}

const getUsedRate = async () => {
	const USDRate = await methods.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.USD_RATE } })
	const usdAmount = parseFloat(USDRate.value);
	return usdAmount
}
const getConsultationFee = async () => {
	const consultationFee = await methods.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.CONSULT_FEE } })
	const consultFee = parseFloat(consultationFee.value);
	return consultFee
}

const methods = {
	create: async (model, data, additional = undefined) => {
		return model.create(data, additional || undefined)
	},
	update: async (model, query, data, additional = undefined) => {
		return model.update(data, query, additional || undefined)
	},
	delete: async (model, query, additional = undefined) => {
		return model.destroy(query, additional || undefined)
	},
	get: async (model, query, additional = undefined) => {
		return model.findOne(query, additional || undefined)
	},
	checkFlag: async (model, query) => {
		return model.count(query)
	},
	// getAll: async (model, query, limit = 10, offset = 0) => {
	// 	return model.findAll({ ...query, limit, offset })
	// },
	getAll: async (model, query) => {
		return model.findAll({ ...query })
	},
	rawQuery: async (model, query, options) => {
		return model.findAll(query, options)
	},
	getById: async (model, id) => {
		return model.findByPk(id)
	},
	getAndCountAll: async (model, query, limit, offset) => {
		return model.findAndCountAll({ ...query, limit, offset })
	},
	bulkCreate: async (model, data, additional = undefined) => {
		return model.bulkCreate(data, additional || undefined)
	},
	generateHashPassword: async (myPassword, salt) => {
		return await bcrypt.hashSync(myPassword, salt)
	},
	passwordCompare: async (myPassword, hash, additional = undefined) => {
		return await bcrypt.compareSync(myPassword, hash, additional || undefined)
	},
	generateToken: (user_id, role_id) => {
		let token = jwt.sign({ user_id: user_id, role_id: role_id }, config.SECRET_KEY, { expiresIn: config.EXPIRES_IN });
		return token;
	},
	getPagination: (page, size) => {
		const limit = size ? +size : 10;
		const offset = page ? page * limit : 0;
		return { limit, offset };
	},
	getPagingData: (alldata, page, limit) => {
		const { count: totalItems, rows: data } = alldata;
		const currentPage = page ? +page : 0;
		const totalPages = Math.ceil(totalItems / limit);
		return { totalItems, data, totalPages, currentPage };
	},
	generateSlug: (username) => {
		const uniqueId = uuidv4().substring(0, 6);
		const slug = `${slugify(`${(username).replace(/\s/g, "").substr(0, 8)}`, { lower: true, trim: true })}-${uniqueId}`;
		return slug;
	},
	generatePatientId: (uniqueNo, name) => {
		const uniqueId = `${uniqueNo.substr(0, 5)}${name.replace(/\s/g, "").substr(0, 5).toLowerCase()}`;
		return uniqueId;
	},
	generateOTP: (length) => {
		let numbers = "01234567890123456789";
		let result = "";
		for (let i = length; i > 0; --i) {
			result = result + numbers[Math.round(Math.random() * (numbers.length - 1))];
		}
		return result;
	},
	generateReferralCode: (length) => {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let referralCode = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			referralCode += characters.charAt(randomIndex);
		}
		return referralCode;
	},
	generateUniqueId: (length) => {
		const randomNo = randomString.generate({
			length: length, charset: 'hex'
		});
		return randomNo
	},
	generateOrderId: (length) => {
		const randomNo = randomString.generate({
			length: length, charset: 'hex'
		});
		const orderId = `order_${randomNo}`
		return orderId
	},
	generatePaymentId: (length) => {
		const randomNo = randomString.generate({
			length: length, charset: 'hex'
		});
		const paymentId = `pay_${randomNo}`
		return paymentId
	},
	verifyUserSubRole: async (userId, subRoleId) => {
		const isUserRole = await EnduserAssignRoles.findOne({ where: { user_id: userId, user_subrole_id: subRoleId } })
		if (isUserRole) {
			return isUserRole
		} else {
			return false
		}
	},
	yearsToDays: (years) => {
		const daysInYear = 365.25; // Taking into account leap years
		const days = years * daysInYear;
		return days;
	},
	haversineDistance: (userLatitude, userLongitude) => {
		const haversine = userLatitude && userLongitude ? `
  (
    3959 * acos(
      cos(radians(${userLatitude}))
      * cos(radians(latitude))
      * cos(radians(longitude) - radians(${userLongitude}))
      + sin(radians(${userLatitude})) * sin(radians(latitude))
    )
  )
` : null
		return haversine
	},
	generateQrCode: async (data) => {
		try {
			console.log(data, "data data data data");
			// toString, toDataURL
			const qrCode = await QRCode.toString(data, {})
			return qrCode
		} catch (error) {
			return error
		}
	}


}


module.exports = { pincodeExist, methods, getUsedRate, getConsultationFee }