const db = require("../../../models");
const message = require("../../admin/message");
const commonResponse = require("./common.response");
const commonConfig = require("../../../config/common.config");
const oralDoctorServices = require("../service");
const emailService = require("../../../services/email");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const emailTmplateServices = require("../../../services/email_template");
const sendAllNotification = require("../../../services/settings");
const moment = require("moment");
const { Op } = require("sequelize");
const randomString = require('randomstring');
const bcrypt = require("bcryptjs");
const { createFirebaseUser } = require("../../../services/firebase");

const User = db.users;


// admin Login
exports.oralDoctorLogIn = async (req, res) => {
  try {
    const email = req.body.email;
    const pwd = req.body.password;
    const query = { where: [{ role_id: 4 }, { email: email }, { is_active: 1 }] };

    const isExistingEmail = await commonServices.get(User, query)

    if (isExistingEmail) {
      let passwordValidate = await commonServices.passwordCompare(pwd, isExistingEmail.password);

      let token = commonServices.generateToken(isExistingEmail.id, isExistingEmail.role_id);

      if (passwordValidate == true) {
        if (isExistingEmail.firebase_uid == null) {
          var firebase_id = await createFirebaseUser({ userId: isExistingEmail.id, email: isExistingEmail.email, full_name: isExistingEmail.full_name })
        } else {
          var firebase_id = isExistingEmail.firebase_uid
        }
        res.status(200).json({
          success: "true",
          message: message.LOGIN_SUCCESS,
          data: commonResponse.logInRes({ isExistingEmail, token, firebase_id }),
        });
      } else {
        res.status(200).json({ success: "false", message: message.INVALID("Password") });
      }
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Oral doctor") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// admin Logout
exports.oralDoctorLogout = async (req, res) => {

  try {

    const user = req.user;
    if (user) {
      res.status(200).json({ success: "true", message: message.LOGOUT_SUCCESS });
    } else {
      res.status(200).json({ success: "true", message: message.LOGOUT_FAILED });
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

//send mail to oral doctor for forgot password
exports.sendForgotPwdLink = async (req, res, next) => {
  try {
    const email = req.body.email
    const user = await commonServices.get(User, { where: [{ email: email }, { is_active: 1 }, { role_id: 4 }] })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Oral doctor email") })
    }

    const resetPwdToken = randomString.generate(20).toString("hex");
    const resetPwdLink = `${commonConfig.front_url}reset-password/${resetPwdToken}`
    const resetTokenExpiration = new Date(new Date().getTime() + (60 * 60 * 1000)) //token expires after one hour
    let obj = {
      resetPasswordToken: resetPwdToken,
      resetPasswordExpiration: resetTokenExpiration
    }
    const data = await commonServices.update(User, { where: { email: email } }, obj)

    if (data != 0) {
      const context = await emailTmplateServices.getForgotPswdContext({ resetPwdLink, fullName: user.full_name, })
      await sendAllNotification.sendAllNotification({ email: req.body.email, context })

      res.status(200).json({ success: 'true', message: 'An e-mail has been sent to ' + email + ' with further instructions!' });
    } else {
      res.status(200).json({ success: "false", message: message.NOT_UPDATE("Token") })
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

}

// view oral doctor profile
exports.viewMyProfile = async (req, res) => {
  try {

    const user = req.user;
    if (user) {
      res.status(200).json({ success: "true", message: message.GET_DATA("Oral doctor data"), data: user })
    } else {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Oral doctor data") })
    }
  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }
};

// change password
exports.changeForgotPwd = async (req, res, next) => {

  try {
    const resetToken = req.params.token;
    const newPassword = req.body.newPassword;
    const tokenData = await commonServices.get(User, { where: [{ resetPasswordToken: resetToken }, { resetPasswordExpiration: { [Op.gt]: moment(Date.now()).format('YYYY-MM-D hh:mm:ss') } }, { is_active: 1 }] });
    if (tokenData) {
      const password = bcrypt.hashSync(newPassword, 8);
      const query = { where: { id: tokenData.id } };
      const obj = {
        password: password,
        updatedBy: tokenData.id
      }
      const resatePassword = await commonServices.update(User, query, obj)
      if (resatePassword != 0) {
        res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Password") });
      } else {
        res.status(200).send({ success: "false", message: message.NOT_UPDATE("Password") });
      }
    } else {
      res.status(200).json({ success: "false", message: message.NO_RESET_TOKEN })
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

}

// edit my profile
exports.editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const roleId = req.user.role_id;
    const doctorId = req.user.oral_doctors.id;

    // let isEmailExisting = await oralDoctorServices.uniqueEmailUpdate(userId, req.body.email);
    // if (!isEmailExisting) {
    //   return res.status(200).json({ success: "false", message: message.DATA_EXIST("email") });
    // }

    // let isPhoneExisting = await oralDoctorServices.uniquePhoneUpdate(req.body.phone_no, userId);
    // if (!isPhoneExisting) {
    //   return res.status(200).json({ success: "false", message: message.DATA_EXIST("phone no") });
    // }

    let isPincodeExist = await oralDoctorServices.isPincodeExist(req.body.pincode);
    if (!isPincodeExist) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Pincode") })
    }

    const t = await db.sequelize.transaction()
    try {
      await contentServices.updateUserProfile({ userId, roleId, ...req.body }, t);
      await contentServices.updateOralDoctorProfile({ userId, ...req.body }, t);

      return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Oral doctor profile") })
    } catch (error) {

      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }
};
