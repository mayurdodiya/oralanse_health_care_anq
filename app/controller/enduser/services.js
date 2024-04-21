const db = require("../../models");
const { check, validationResult } = require("express-validator");
const Op = db.Sequelize.Op;
const User = db.users;
const Patient = db.patients;
const Clinics = db.clinics;

module.exports = {
  phoneExist: (phone) => {
    return User.count({ where: { phone_no: phone } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  emailExist: (email) => {
    return User.count({ where: { email: email } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    });
  },
  uniqueEmailUpdate: (email, userId) => {
    return User.count({ where: { email: email, id: { [Op.ne]: userId } } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  uniquePhoneUpdate: (phoneNo, userId) => {
    return User.count({ where: { phone_no: phoneNo, id: { [Op.ne]: userId } } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  familyMemberExist: (email, phoneNo, userId, relationship) => {
    return Patient.count({ where: { phone_no: phoneNo, email: email, user_id: userId, relationship: relationship } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  uniqueFamilyMemberUpdate: (data) => {
    return Patient.count({ where: { unique_id: { [Op.ne]: data.unique_id }, phone_no: data.phone_no, email: data.email, user_id: data.userId, relationship: data.relationship } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true;
    })
  },
  clinicPhoneExist: (phone) => {
    return Clinics.count({ where: { clinic_phone_number: phone } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true; // phone is unique
    })
  },
  uniqueClinicPhoneUpdate: (clinicPhoneNumber, clinicId) => {
    return Clinics.count({ where: { clinic_phone_number: clinicPhoneNumber, id: { [Op.ne]: clinicId } } }).then((count) => {
      if (count != 0) {
        return false;
      }
      return true; // phone is unique
    })
  },
}