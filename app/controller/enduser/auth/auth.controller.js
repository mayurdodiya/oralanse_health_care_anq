const db = require("../../../models");
const axios = require('axios');
const { methods: commonServices, pincodeExist } = require("../../../services/common");
const { methods: contentServices } = require("../../../services/content")
const endUserServices = require("../../enduser/services");
const emailTmplateServices = require("../../../services/email_template");
const uploadService = require("../../../services/uploadFile");
const commonResponse = require("./common.response");
const authServices = require("./service");
const commonConfig = require("../../../config/common.config");
const message = require("../message");
const config = require("../../../config/config.json");
const options = require('../../../config/options');
const sendAllNotification = require("../../../services/settings");
const WhatsAppHelper = require("../../../services/wa_message_helper");
const Op = db.Sequelize.Op;
const { createFirebaseUser } = require("../../../services/firebase");

const User = db.users;
const UserDetails = db.user_details;
const Patient = db.patients;
const Otps = db.otps;
const DeviceToken = db.device_tokens;
const City = db.cities;
const UserSubrole = db.user_subroles;
const Area = db.areas;
const Specialities = db.specialities;
const Facilities = db.facilities;
const Treatments = db.treatments;
const Degrees = db.degrees;
const Colleges = db.colleges;
const BloodTypes = db.blood_types;
const LabTests = db.lab_tests;
const RegistrationCouncils = db.registration_councils;
const Language = db.languages;



//upload image
exports.uploadSingleFile = async (req, res) => {
  try {
    const userId = req.user.id
    const file = req.file;
    const folderPath = req.body.folderPath
    if (file) {
      await uploadService.uploadFileWithAws(folderPath, file, options.mediaType.IMAGE, (err, location) => {
        if (err) {
          return res.status(200).json({ success: "false", message: err.message })
        } else {
          return res.status(200).json({ success: "true", message: message.UPLOAD_FILE_SUCCESS, data: location })
        }
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_FILE })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//upload image
exports.uploadMultipleFile = async (req, res) => {
  try {
    const userId = req.user.id
    const file = req.files;
    const folderPath = req.body.folderPath
    if (file.length != 0) {
      await uploadService.uploadMultipleFileWithAws(folderPath, file, options.mediaType.IMAGE, (err, location) => {
        if (err) {
          return res.status(200).json({ success: "false", message: err.message })
        } else {
          return res.status(200).json({ success: "true", message: message.UPLOAD_FILE_SUCCESS, data: location })
        }
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_FILE })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//send otp
exports.sendOtp = async (req, res) => {
  try {
    const countryCode = req.body.countryCode;
    const value = req.body.value
    const type = req.body.type
    // const randomOtp = commonServices.generateOTP(6);
    const randomOtp = 123456;
    const existOtp = await contentServices.otpExist(value)
    if (existOtp) {
      if (type === "email") {
        await commonServices.create(Otps, { email: value, otp: randomOtp })
        res.status(200).json({ success: "true", message: message.SEND_OTP_SUCCESS("Email") });

        const context = await emailTmplateServices.getOtpContext({ otp: randomOtp })
        await sendAllNotification.sendAllNotification({ email: req.body.value, context })

      } else if (type === "phone") {
        await commonServices.create(Otps, { phone_no: value, otp: randomOtp })
        res.status(200).json({ success: "true", message: message.SEND_OTP_SUCCESS("Phone number") });
      }
    } else {
      await commonServices.update(Otps, { where: { [Op.or]: [{ email: value }, { phone_no: value }] } }, { otp: randomOtp })
      if (type === "email") {
        res.status(200).json({ success: "true", message: message.SEND_OTP_SUCCESS("Email") });
        const context = await emailTmplateServices.getOtpContext({ otp: randomOtp })
        await sendAllNotification.sendAllNotification({ email: req.body.value, context })
      } else if (type === "phone") {
        res.status(200).json({ success: "true", message: message.SEND_OTP_SUCCESS("Phone number") });
      }
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message, });
  }
};

//verify otp
exports.verifyOtp = async (req, res) => {
  try {
    const value = req.body.value;
    const otp = req.body.otp;
    const device_token = req.body.device_token;
    const type = req.body.type;

    const otpData = await commonServices.get(Otps, { where: { [Op.or]: [{ email: value }, { phone_no: value }] } })
    if (otpData != null) {
      if (otpData.otp == otp) {
        const query = {
          where: { [Op.or]: [{ email: value }, { phone_no: value }], is_active: true },
          attributes: ["id", "role_id", "full_name", "email", "slug", "countryCode", "phone_no", "profile_image", "is_active", "firebase_uid"],
          include: [
            { model: UserDetails, as: "user_details", attributes: ["address1", "address2", "gender", "age", "location", "latitude", "longitude", "active_profile", "language_id"], include: [{ model: Language, as: "userLanguage", attributes: ["code", "name"] }] },
            { model: Patient, as: "patients", attributes: ["unique_id", "gender", "age", "relationship"], where: { relationship: options.RelationType.SELF } }]
        }
        const userData = await commonServices.get(User, query)
        if (userData) {
          const response = JSON.parse(JSON.stringify(userData))
          if (response.firebase_uid == null) {
            var firebaseUid = await createFirebaseUser({ userId: userData.id, email: response.email, full_name: response.full_name })
          } else {
            var firebaseUid = response.firebase_uid
          }

          if (typeof device_token === 'string' && device_token !== '') {
            const isDeviceToken = await contentServices.deviceTokenExist(response.id, device_token)
            if (isDeviceToken) {
              await commonServices.create(DeviceToken, { user_id: response.id, device_token: device_token })
            }
          }
          var token = commonServices.generateToken(response.id, response.role_id);
          const responseData = { ...response, firebase_uid: firebaseUid, is_registered: true, accessToken: token, type: type }
          res.status(200).json({
            success: "true",
            message: message.VERIFIED_OTP_SUCCESS,
            data: responseData,
          })
        } else {
          res.status(200).json({
            success: "true",
            message: message.VERIFIED_OTP_SUCCESS,
            data: {
              value: value,
              is_registered: false,
              type: type
            }
          })
        }
      } else {
        res.status(200).json({ success: "false", message: message.INVALID_OTP });
      }
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Otp") });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }

};

//get city from pincode
exports.getCityFromPincode = async (req, res) => {
  const { pincode } = req.query
  const areadata = await commonServices.get(Area, { where: { pincode: pincode } })
  if (areadata) {
    const citydata = await commonServices.get(City, { where: { id: areadata.city_id }, attributes: ["city_name", "state_name", "country_name"] })

    return res.status(200).json({ success: "true", message: message.GET_DATA("City"), data: citydata })
  } else {
    res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
  }
}

//user registration
exports.userRegistration = async (req, res) => {
  try {
    const otp = req.body.otp
    const full_name = req.body.full_name
    const email = req.body.email
    const phone_no = req.body.phone_no
    const type = req.query.type
    if (otp) {
      const otpData = await commonServices.get(Otps, { where: { [Op.or]: [{ email }, { phone_no }] } })
      if (otpData != null) {
        if (otpData.otp == otp) {
          const emailExist = await endUserServices.emailExist(email)
          if (emailExist) {
            const phoneExist = await endUserServices.phoneExist(phone_no)
            if (phoneExist) {
              const slug = commonServices.generateSlug(full_name)
              const t = await db.sequelize.transaction()
              try {
                const data = await contentServices.createUserProfile({ slug, ...req.body }, t)
                if (data) {
                  const patient = await contentServices.createPatientProfile({ userId: data.user.id, ...req.body }, t)
                  await t.commit()
                  await commonServices.update(User, { where: { id: data.user.id } }, { createdBy: data.user.id })
                  const token = commonServices.generateToken(data.user.id, 3);
                  var resData = {}
                  resData.user = data.user
                  resData.userdetails = data.userdetails
                  resData.patient = patient
                  const response = commonResponse.modifyUser(resData)
                  const firebaseUid = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
                  const context = await emailTmplateServices.getOnBoardingContext({ username: full_name })
                  await sendAllNotification.sendAllNotification({ email, context })
                  return res.status(200).json({ success: "true", message: message.REGISTER_SUCCESS, data: { ...response, accessToken: token, firebase_uid: firebaseUid } })
                } else {
                  return res.status(200).json({ success: "false", message: message.REGISTER_FAILD })
                }
              } catch (error) {
                await t.rollback()
                return res.status(200).json({ success: "false", message: error.message })
              }
            } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
          } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
        } else { res.status(200).json({ success: "false", message: message.INVALID_OTP }); }
      } else { res.status(200).json({ success: "false", message: message.NO_DATA("Otp") }); }
    } else {
      if (type == "google") {
        const phoneExist = await endUserServices.phoneExist(phone_no)
        if (phoneExist) {
          const slug = commonServices.generateSlug(full_name)
          const t = await db.sequelize.transaction()
          try {
            const data = await contentServices.createUserProfile({ slug, ...req.body }, t)
            if (data) {
              const patient = await contentServices.createPatientProfile({ userId: data.user.id, ...req.body }, t)
              await t.commit()
              await commonServices.update(User, { where: { id: data.user.id } }, { createdBy: data.user.id })
              const token = commonServices.generateToken(data.user.id, 3);
              var resData = {}
              resData.user = data.user
              resData.userdetails = data.userdetails
              resData.patient = patient
              const response = commonResponse.modifyUser(resData)
              const firebaseUid = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
              const context = await emailTmplateServices.getOnBoardingContext({ username: full_name })
              await sendAllNotification.sendAllNotification({ email, context })
              return res.status(200).json({ success: "true", message: message.REGISTER_SUCCESS, data: { ...response, accessToken: token, firebase_uid: firebaseUid } })
            } else {
              return res.status(200).json({ success: "false", message: message.REGISTER_FAILD })
            }
          } catch (error) {
            await t.rollback()
            return res.status(200).json({ success: "false", message: error.message })
          }
        } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
      } else if (type == "facebook") {
        const emailExist = await endUserServices.emailExist(email)
        if (emailExist) {
          const phoneExist = await endUserServices.phoneExist(phone_no)
          if (phoneExist) {
            const slug = commonServices.generateSlug(full_name)
            const t = await db.sequelize.transaction()
            try {
              const data = await contentServices.createUserProfile({ slug, ...req.body }, t)
              if (data) {
                const patient = await contentServices.createPatientProfile({ userId: data.user.id, ...req.body }, t)
                await t.commit()
                await commonServices.update(User, { where: { id: data.user.id } }, { createdBy: data.user.id })
                const token = commonServices.generateToken(data.user.id, 3);
                var resData = {}
                resData.user = data.user
                resData.userdetails = data.userdetails
                resData.patient = patient
                const response = commonResponse.modifyUser(resData)
                const firebaseUid = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
                const context = await emailTmplateServices.getOnBoardingContext({ username: full_name })
                await sendAllNotification.sendAllNotification({ email, context })
                return res.status(200).json({ success: "true", message: message.REGISTER_SUCCESS, data: { ...response, accessToken: token, firebase_uid: firebaseUid } })
              } else {
                return res.status(200).json({ success: "false", message: message.REGISTER_FAILD })
              }
            } catch (error) {
              await t.rollback()
              return res.status(200).json({ success: "false", message: error.message })
            }
          } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
        } else {
          const userData = await commonServices.get(User, { where: { email: email, is_active: 1 }, include: [{ model: UserDetails, as: "user_details", include: [{ model: Language, as: "userLanguage", attributes: ["code", "name"] }] }, { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } }] })
          await commonServices.update(User, { where: { id: userData.id } }, { facebook_id: req.body.facebook_id })
          if (typeof req.body.device_token === 'string' && req.body.device_token !== '') {
            const isDeviceToken = await contentServices.deviceTokenExist(userData.id, req.body.device_token)
            if (isDeviceToken) {
              await commonServices.create(DeviceToken, { user_id: userData.id, device_token: req.body.device_token })
            }
          }
          const token = commonServices.generateToken(userData.id, userData.role_id);
          var responseData = {}
          responseData.user = {
            id: userData.id,
            role_id: userData.role_id,
            is_active: userData.is_active,
            full_name: userData.full_name,
            email: userData.email,
            slug: userData.slug,
            firebase_uid: userData.firebase_uid,
            countryCode: userData.countryCode,
            phone_no: userData.phone_no,
            profile_image: userData.profile_image,
          }
          responseData.userdetails = JSON.parse(JSON.stringify(userData.user_details))
          responseData.patient = JSON.parse(JSON.stringify(userData.patients))
          const response = commonResponse.modifyUser(responseData)
          if (response.firebase_uid == null) {
            var firebase_id = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
          } else {
            var firebase_id = response.firebase_uid
          }
          return res.status(200).json({ success: "true", message: message.REGISTER_SUCCESS, data: { ...response, userLanguage: userData.user_details.userLanguage, firebase_uid: firebase_id, is_registered: true, accessToken: token } })
        }
      }
    }

  } catch (error) { res.status(200).json({ success: "false", message: error.message, }) }
};

//signinwithGoogle
exports.signinWithGoogle1 = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userData = await commonServices.get(User, { where: { email: email, is_active: 1 }, include: [{ model: UserDetails, as: "user_details", include: [{ model: Language, as: "userLanguage", attributes: ["code", "name"] }] }, { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } }] })
    if (userData) {
      const t = await db.sequelize.transaction()
      try {
        const data = await contentServices.updateUserProfile({ userId: userData.id, roleId: userData.role_id, ...req.body }, t)
        if (data) {
          const patient = await contentServices.updatePatientProfile({ userId: userData.id, unique_id: userData.patients.unique_id, ...req.body }, t)
          await t.commit()
          if (typeof req.body.device_token === 'string' && req.body.device_token !== '') {
            const isDeviceToken = await contentServices.deviceTokenExist(userData.id, req.body.device_token)
            if (isDeviceToken) {
              await commonServices.create(DeviceToken, { user_id: userData.id, device_token: req.body.device_token })
            }
          }
          const token = commonServices.generateToken(userData.id, userData.role_id);
          var responseData = {}
          responseData.user = {
            id: userData.id,
            role_id: userData.role_id,
            is_active: userData.is_active,
            full_name: userData.full_name,
            email: userData.email,
            slug: userData.slug,
            firebase_uid: userData.firebase_uid,
            countryCode: userData.countryCode,
            phone_no: userData.phone_no,
            profile_image: userData.profile_image,
          }
          responseData.userdetails = JSON.parse(JSON.stringify(userData.user_details))
          responseData.patient = JSON.parse(JSON.stringify(userData.patients))
          const response = commonResponse.modifyUser(responseData)
          if (response.firebase_uid == null) {
            var firebase_id = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
          } else {
            var firebase_id = response.firebase_uid
          }
          return res.status(200).json({ success: "true", message: message.LOGIN_SUCCESS, data: { ...response, userLanguage: userData.user_details.userLanguage, firebase_uid: firebase_id, is_registered: true, accessToken: token } })
        } else {
          return res.status(200).json({ success: "false", message: message.LOGIN_FAILED })
        }
      } catch (error) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    } else {
      const slug = commonServices.generateSlug(req.body.full_name)
      const t = await db.sequelize.transaction()
      try {
        const data = await contentServices.createUserProfile({ slug, ...req.body }, t)
        if (data) {
          const patient = await contentServices.createPatientProfile({ userId: data.user.id, ...req.body }, t)
          await t.commit()
          if (typeof req.body.device_token === 'string' && req.body.device_token !== '') {
            const isDeviceToken = await contentServices.deviceTokenExist(data.user.id, req.body.device_token)
            if (isDeviceToken) {
              await commonServices.create(DeviceToken, { user_id: data.user.id, device_token: req.body.device_token })
            }
          }
          await commonServices.update(User, { where: { id: data.user.id } }, {
            createdBy: data.user.id
          })
          const token = commonServices.generateToken(data.user.id, 3);
          var resData = {}
          resData.user = data.user
          resData.userdetails = data.userdetails
          resData.patient = patient
          const response = commonResponse.modifyUser(resData)
          var firebaseUid = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
          return res.status(200).json({ success: "true", message: message.LOGIN_SUCCESS, data: { ...response, firebase_uid: firebaseUid, accessToken: token } })
        } else {
          return res.status(200).json({ success: "false", message: message.LOGIN_FAILED })
        }
      } catch (error) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
      // res.status(200).json({
      //   success: "true",
      //   message: message.NO_DATA("User profile"),
      //   data: {
      //     value: value,
      //     is_registered: false,
      //     type: type
      //   }
      // })
    }
  } catch (error) {
    res.status(200).json({
      success: "false",
      message: error.message
    })
  }
}

//signinwithGoogle
exports.signinWithGoogle = async (req, res, next) => {
  try {
    const google_id = req.body.google_id;
    const email = req.body.email;
    const userData = await commonServices.get(User, { where: { email: email, is_active: 1 }, include: [{ model: UserDetails, as: "user_details", include: [{ model: Language, as: "userLanguage", attributes: ["code", "name"] }] }, { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } }] })
    if (userData) {
      const t = await db.sequelize.transaction()
      try {
        if (userData.google_id == null) {
          await commonServices.update(User, { where: { id: userData.id } }, { google_id: google_id })
        }
        // const data = await contentServices.updateUserProfile({ userId: userData.id, roleId: userData.role_id, ...req.body }, t)
        // if (data) {
        // const patient = await contentServices.updatePatientProfile({ userId: userData.id, unique_id: userData.patients.unique_id, ...req.body }, t)
        await t.commit()
        if (typeof req.body.device_token === 'string' && req.body.device_token !== '') {
          const isDeviceToken = await contentServices.deviceTokenExist(userData.id, req.body.device_token)
          if (isDeviceToken) {
            await commonServices.create(DeviceToken, { user_id: userData.id, device_token: req.body.device_token })
          }
        }
        const token = commonServices.generateToken(userData.id, userData.role_id);
        var responseData = {}
        responseData.user = {
          id: userData.id,
          role_id: userData.role_id,
          is_active: userData.is_active,
          full_name: userData.full_name,
          email: userData.email,
          slug: userData.slug,
          firebase_uid: userData.firebase_uid,
          countryCode: userData.countryCode,
          phone_no: userData.phone_no,
          profile_image: userData.profile_image,
        }
        responseData.userdetails = JSON.parse(JSON.stringify(userData.user_details))
        responseData.patient = JSON.parse(JSON.stringify(userData.patients))
        const response = commonResponse.modifyUser(responseData)
        if (response.firebase_uid == null) {
          var firebase_id = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
        } else {
          var firebase_id = response.firebase_uid
        }
        return res.status(200).json({ success: "true", message: message.LOGIN_SUCCESS, data: { ...response, userLanguage: userData.user_details.userLanguage, firebase_uid: firebase_id, is_registered: true, accessToken: token } })
        // } else {
        //   return res.status(200).json({ success: "false", message: message.LOGIN_FAILED })
        // }
      } catch (error) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("User profile"),
        data: {
          is_registered: false
        }
      })
    }
  } catch (error) {
    res.status(200).json({
      success: "false",
      message: error.message
    })
  }
}

//signinwithGoogle
exports.signinWithFacebook = async (req, res, next) => {
  try {
    const facebook_id = req.body.facebook_id;
    const userData = await commonServices.get(User, { where: { facebook_id: facebook_id, is_active: 1 }, include: [{ model: UserDetails, as: "user_details", include: [{ model: Language, as: "userLanguage", attributes: ["code", "name"] }] }, { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } }] })
    if (userData) {
      const t = await db.sequelize.transaction()
      try {
        // const data = await contentServices.updateUserProfile({ userId: userData.id, roleId: userData.role_id, ...req.body }, t)
        // if (data) {
        // const patient = await contentServices.updatePatientProfile({ userId: userData.id, unique_id: userData.patients.unique_id, ...req.body }, t)
        await t.commit()
        if (typeof req.body.device_token === 'string' && req.body.device_token !== '') {
          const isDeviceToken = await contentServices.deviceTokenExist(userData.id, req.body.device_token)
          if (isDeviceToken) {
            await commonServices.create(DeviceToken, { user_id: userData.id, device_token: req.body.device_token })
          }
        }
        const token = commonServices.generateToken(userData.id, userData.role_id);
        var responseData = {}
        responseData.user = {
          id: userData.id,
          role_id: userData.role_id,
          is_active: userData.is_active,
          full_name: userData.full_name,
          email: userData.email,
          slug: userData.slug,
          firebase_uid: userData.firebase_uid,
          countryCode: userData.countryCode,
          phone_no: userData.phone_no,
          profile_image: userData.profile_image,
        }
        responseData.userdetails = JSON.parse(JSON.stringify(userData.user_details))
        responseData.patient = JSON.parse(JSON.stringify(userData.patients))
        const response = commonResponse.modifyUser(responseData)
        if (response.firebase_uid == null) {
          var firebase_id = await createFirebaseUser({ userId: response.id, email: response.email, full_name: response.full_name })
        } else {
          var firebase_id = response.firebase_uid
        }
        return res.status(200).json({ success: "true", message: message.LOGIN_SUCCESS, data: { ...response, userLanguage: userData.user_details.userLanguage, firebase_uid: firebase_id, is_registered: true, accessToken: token } })
        // } else {
        //   return res.status(200).json({ success: "false", message: message.LOGIN_FAILED })
        // }
      } catch (error) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("User profile"),
        data: {
          is_registered: false
        }
      })
    }
  } catch (error) {
    res.status(200).json({
      success: "false",
      message: error.message
    })
  }
}

//send code to whatsApp
exports.sendCodeToWhatsApp = async (req, res) => {
  try {
    const countryCode = req.body.countryCode;
    const value = req.body.value
    // const randomOtp = commonServices.generateOTP(6);
    const randomOtp = 123456;
    const existOtp = await contentServices.otpExist(value)
    if (existOtp) {
      await commonServices.create(Otps, { phone_no: value, otp: randomOtp })
      const sendOtpOnWhataApp = WhatsAppHelper.whatAppMsg({ countryCode, phone_no: value })
      res.status(200).json({ success: "true", message: message.SEND_OTP_SUCCESS("Whats App Account") });
    } else {
      await commonServices.update(Otps, { where: { phone_no: value } }, { otp: randomOtp })
      const sendOtpOnWhataApp = WhatsAppHelper.whatAppMsg({ countryCode, phone_no: value, req })
      res.status(200).json({ success: "true", message: message.SEND_OTP_SUCCESS("Whats App Account") });
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: "false", message: error.message, });
  }
}

//user logout
exports.logOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const deviceToken = await commonServices.getAll(DeviceToken, { where: { user_id: userId } })
    if (deviceToken.length != 0) {
      const logout = await commonServices.delete(DeviceToken, { where: { user_id: userId } })
      if (logout != 0) {
        res.status(200).json({ success: "true", message: message.LOGOUT_SUCCESS })
      } else {
        res.status(200).json({ success: "true", message: message.LOGOUT_SUCCESS })
      }
    } else { res.status(200).json({ success: "true", message: message.LOGOUT_SUCCESS }) }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

//edit profile
exports.editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const roleId = req.user.role_id
    const uniqueId = req.user.patients.unique_id
    // const emailExist = await endUserServices.uniqueEmailUpdate(req.body.email, userId)
    // if (emailExist) {
    // const phoneExist = await endUserServices.uniquePhoneUpdate(req.body.phone_no, userId)
    // if (phoneExist) {
    const t = await db.sequelize.transaction()
    try {
      if (req.body.pincode) {
        const pincodeData = await pincodeExist(req.body.pincode)
        if (pincodeData) {
          return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
        }
      }
      await contentServices.updateUserProfile({ userId, roleId, ...req.body }, t)
      await contentServices.updatePatientProfile({ userId, unique_id: uniqueId, ...req.body }, t)
      await contentServices.createOrUpdateUserInsurance({ userId, patientId: req.user.patients.id, ...req.body }, t)
      await t.commit()
      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User data") })
    } catch (error) {

      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
    // } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
    // } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Email") }) }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//viewProfile
exports.viewProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const userData = await contentServices.viewUserProfile({ userId })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }
    const response = commonResponse.modifyProfile(userData)
    return res.status(200).json({ success: "true", message: message.GET_PROFILE("User"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//change language
exports.changeLanguage = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = await commonServices.update(UserDetails, { where: { user_id: userId } }, { language_id: req.body.language_id })
    if (updateData[0] != 0) {
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Language") })
    } else {
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA_FAILED("Language") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//get all languages
exports.getAllLanguages = async (req, res) => {
  try {
    const query = {
      attributes: ["id", "name", "code"]
    }
    const language = await contentServices.getAllLanguages(query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Language"), data: language })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get all pincodes
exports.getAllPincodes = async (req, res) => {
  try {
    const query = {
      attributes: ["id", "name", "pincode"],
      include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }]
    }
    const pincode = await contentServices.getAllPincodes(query)
    return res.status(200).json({ success: "true", message: message.GET_LIST("Pincode"), data: pincode })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  } ``
}

// get all specialists
exports.getAllSpecialists = async (req, res) => {

  try {

    let query = {
      where: [],
      attributes: ['id', 'name', 'image_path', 'parent_specialist_id'],
      include: [
        { model: Specialities, as: "specialitiesData", required: false, attributes: ['id', 'name', 'image_path', 'parent_specialist_id'] },
      ]
    };

    let data = await commonServices.getAll(Specialities, query)
    if (data) {
      let responseData = JSON.parse(JSON.stringify(data))

      responseData.map(item => {
        item.image_path != null ? item.image_path : null
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Specialities"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Specialities") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all facilities
exports.getAllfacilities = async (req, res) => {

  try {

    let query = {
      where: [],
      attributes: ['id', 'name']
    };

    let data = await commonServices.getAll(Facilities, query)
    if (data) {
      let responseData = JSON.parse(JSON.stringify(data))

      responseData.map(item => {
        item.image_path != null ? item.image_path : null
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Facilities"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Facilities") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all treatment
exports.getAlltreatments = async (req, res) => {
  try {
    const { s } = req.query
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { 'name': { [Op.like]: `%${s}%` } },
        ]
      }
    }
    const query = {
      where: { ...searchData },
      attributes: ["id", "name", "speciality_id", "image_path"],
    }
    let data = await commonServices.getAll(Treatments, query)
    if (data) {
      let responseData = JSON.parse(JSON.stringify(data))

      responseData.map(item => {
        item.image_path != null ? item.image_path : null
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Treatments"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Treatments") })
    }
  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all degrees
exports.getAllDegree = async (req, res) => {

  try {

    const query = {
      where: [],
      attributes: ["id", "name"],
    }

    let data = await commonServices.getAll(Degrees, query)
    if (data) {
      let responseData = JSON.parse(JSON.stringify(data))

      responseData.map(item => {
        item.image_path != null ? item.image_path : null
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Degrees"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Degrees") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all collages
exports.getAllCollages = async (req, res) => {

  try {

    const query = {
      where: [],
      attributes: ["id", "name"],
    }

    let data = await commonServices.getAll(Colleges, query)
    if (data) {
      let responseData = JSON.parse(JSON.stringify(data))

      responseData.map(item => {
        item.image_path != null ? item.image_path : null
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Colleges"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Colleges") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all blood types
exports.getAllBloodTypes = async (req, res) => {

  try {

    const query = {
      where: [],
      attributes: ["id", "name"],
    }

    let data = await commonServices.getAll(BloodTypes, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Blood types"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Blood types") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all lab tests
exports.getAllLabTests = async (req, res) => {

  try {

    const query = {
      where: [],
      attributes: ["id", "name", "category", "sub_category"],
    }

    let data = await commonServices.getAll(LabTests, query)
    data.map(item => {
      item.name = JSON.parse(item.name)
    })
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Lab tests"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Lab tests") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// get all registration councils
exports.getAllRegistrationCouncils = async (req, res) => {

  try {

    const query = {
      where: [],
      attributes: ["id", "name"],
    }

    let data = await commonServices.getAll(RegistrationCouncils, query)
    if (data) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Registration councils"), data: data })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Registration councils") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

//switch profile
exports.switchProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const subProfile = req.query.profile
    const subrole = await commonServices.get(UserSubrole, { where: { name: subProfile } })
    if (subrole == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Profile name") })
    }
    let userDetail = commonResponse.modifySwitchProfile(req.user)
    userDetail.active_profile = subProfile
    if (subProfile == options.PortalType.PATIENT) {
      await authServices.switchProfile({ userId, subProfile })
      return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Profile"), data: userDetail })
    } else {
      await authServices.switchProfile({ userId, subProfile })
      let flagData = {}
      const endUserSubRole = await commonServices.verifyUserSubRole(userId, subrole.id)
      if (endUserSubRole) {
        if (endUserSubRole.user_subrole_id == 1) {
          flagData.doctorProfile = true
        }
        if (endUserSubRole.user_subrole_id == 2) {
          flagData.hospitalProfile = true
        }
        if (endUserSubRole.user_subrole_id == 3) {
          flagData.staffProfile = true
        }
        if (endUserSubRole.user_subrole_id == 4) {
          flagData.nurseProfile = true
        }
        if (endUserSubRole.user_subrole_id == 5) {
          flagData.pharmacistProfile = true
        }
        if (endUserSubRole.user_subrole_id == 6) {
          flagData.hrProfile = true
        }
        if (endUserSubRole.user_subrole_id == 7) {
          flagData.labProfile = true
        }
        if (endUserSubRole.user_subrole_id == 8) {
          flagData.dentalLabProfile = true
        }
        if (endUserSubRole.user_subrole_id == 9) {
          flagData.dentalClinicProfile = true
        }
        if (endUserSubRole.user_subrole_id == 10) {
          flagData.healthCenterProfile = true
        }
        let respData = { ...userDetail, ...flagData }
        return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Profile"), data: respData })
      } else {
        if (subrole.id == 1) {
          flagData.doctorProfile = false
        }
        if (subrole.id == 2) {
          flagData.hospitalProfile = false
        }
        if (subrole.id == 3) {
          flagData.staffProfile = false
        }
        if (subrole.id == 4) {
          flagData.nurseProfile = false
        }
        if (subrole.id == 5) {
          flagData.pharmacistProfile = false
        }
        if (subrole.id == 6) {
          flagData.hrProfile = false
        }
        if (subrole.id == 7) {
          flagData.labProfile = false
        }
        if (subrole.id == 8) {
          flagData.dentalLabProfile = false
        }
        if (subrole.id == 9) {
          flagData.dentalClinicProfile = false
        }
        if (subrole.id == 10) {
          flagData.healthCenterProfile = false
        }
        return res.status(200).json({ success: "false", message: message.NO_SUBROLE_PROFILE(`${subProfile}`), data: flagData })
      }
    }
  } catch (error) { res.status(200).json({ success: "false", message: error.message }) }
}

//Get active profile
exports.userActiveProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const userData = await commonServices.get(User, { where: { id: userId }, include: [{ model: UserDetails, as: "user_details" }] })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }
    return res.status(200).json({
      success: "true", message: message.CHANGE_DATA("Profile"), data: {
        active_profile: userData.user_details.active_profile
      }
    })
  } catch (error) { res.status(200).json({ success: "false", message: error.message }) }
}
