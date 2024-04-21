const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
const options = require("../config/options")
const db = require('../models');
const message = require("./message");
const Op = db.Sequelize.Op;

const User = db.users;
const Roles = db.roles;
const Doctors = db.doctors;
const OralDoctors = db.oral_doctors;
const UserDetail = db.user_details;
const Patient = db.patients;
const EnduserAssignRoles = db.enduser_assign_roles;
const UserSubRoles = db.user_subroles;
const Clinics = db.clinics;
const HospitalAdmin = db.hospital_admins;
const ClinicStaffs = db.clinic_staffs;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).json({
      success: "false",
      message: message.Auth.TOKEN_EXPIRED
    });
  }
  return res.status(401).json({
    success: "false",
    message: message.Auth.BAD_REQUEST
  });
}

exports.verifyUserToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({
      success: "false",
      message: message.Auth.NO_TOKEN
    });
  }
  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) { return catchError(err, res); }
    User.findOne({
      where: [{ id: decoded.user_id }, { role_id: 3 }, { is_active: 1 }],
      include: [{ model: UserDetail, as: "user_details" }, { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } }]
    }).then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({
          success: "false",
          message: message.Auth.NO_USER
        });
      }
    }).catch(err => {

      return res.status(403).json({
        success: "false",
        message: message.Auth.BAD_REQUEST || err
      });
    })
  });
};

exports.verifyDoctorToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ success: "false", message: message.Auth.NO_TOKEN });
  }

  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) { return catchError(err, res); }
    User.findOne({
      where: [{ id: decoded.user_id }, { role_id: 3 }, { is_active: 1 }]
    }).then(async (isUser) => {
      if (isUser) {

        const doctorRole = await UserSubRoles.findOne({ where: [{ name: options.PortalType.DOCTOR }] })
        const doctorRoleId = doctorRole.id;
        const checkRole = await EnduserAssignRoles.findOne({ where: [{ user_subrole_id: doctorRoleId }, { user_id: decoded.user_id }] })

        if (checkRole.user_id == decoded.user_id) {
          var query = {
            where: { id: decoded.user_id },
            include: [
              { model: UserDetail, as: "user_details", },
              { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } },
              { model: Doctors, as: "doctors", }
            ]
          }
        }

        User.findOne(query).then((user) => {
          if (user) {
            req.user = user;
            next();
          } else {
            return res.status(403).json({ success: "false", message: message.Auth.NO_USER });
          }
        }).catch(err => {

          return res.status(403).json({
            success: "false",
            message: message.Auth.BAD_REQUEST || err
          });
        })

      } else {
        return res.status(403).json({ success: "false", message: message.Auth.NO_USER });
      }
    }).catch(err => {

      return res.status(403).json({
        success: "false",
        message: message.Auth.BAD_REQUEST || err
      });
    })
  });

};

exports.verifyHospitalToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ success: "false", message: message.Auth.NO_TOKEN });
  }

  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) { return catchError(err, res); }
    User.findOne({
      where: [{ id: decoded.user_id }, { role_id: 3 }, { is_active: 1 }]
    }).then(async (isUser) => {
      if (isUser) {

        const hospitalRole = await UserSubRoles.findOne({ where: [{ name: options.PortalType.HOSPITAL }] })
        const hospitalRoleId = hospitalRole.id;
        const checkRole = await EnduserAssignRoles.findOne({ where: [{ user_subrole_id: hospitalRoleId }, { user_id: decoded.user_id }] })


        if (checkRole.user_id == decoded.user_id) {
          var query = {
            where: { id: decoded.user_id },
            include: [
              { model: UserDetail, as: "user_details", },
              { model: Patient, as: "patients", where: { relationship: options.RelationType.SELF } },
              { model: Clinics, as: "clinics" }
            ]
          }
        }

        User.findOne(query).then((user) => {
          if (user) {
            req.user = user;
            next();
          } else {
            return res.status(403).json({ success: "false", message: message.Auth.NO_USER });
          }
        }).catch(err => {

          return res.status(403).json({
            success: "false",
            message: message.Auth.BAD_REQUEST || err
          });
        })

      } else {
        return res.status(403).json({ success: "false", message: message.Auth.NO_USER });
      }
    }).catch(err => {

      return res.status(403).json({
        success: "false",
        message: message.Auth.BAD_REQUEST || err
      });
    })
  });

};

exports.verifyAdminToken = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({
      success: "false",
      message: message.Auth.NO_TOKEN
    });
  }
  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) { return catchError(err, res) }
    User.findOne({ where: [{ id: decoded.user_id }, [{ role_id: { [Op.or]: [1, 2] } }]] }).then((user) => {
      if (user) {
        req.user = user
        next();
      } else {
        return res.status(403).json({
          success: "false",
          message: message.Auth.BAD_REQUEST
        });
      }
    }).catch(err => {
      return res.status(403).json({
        success: "false",
        message: message.Auth.BAD_REQUEST || err
      });
    })
  });
};

exports.verifyOralDoctorToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ success: "false", message: message.Auth.NO_TOKEN });
  }

  jwt.verify(token, config.SECRET_KEY, (err, decoded) => {
    if (err) { return catchError(err, res); }
    User.findOne({
      where: [{ id: decoded.user_id }, { role_id: 4 }, { is_active: 1 }]
    }).then(async (isUser) => {
      if (isUser) {

        const doctorRole = await Roles.findOne({ where: [{ name: options.PortalType.ORALDOCTOR }] })
        const doctorRoleId = doctorRole.id;
        const checkRole = await EnduserAssignRoles.findOne({ where: [{ user_subrole_id: doctorRoleId }, { user_id: decoded.user_id }] })

        if (checkRole.user_id == decoded.user_id) {
          var query = {
            where: { id: decoded.user_id },
            include: [
              { model: UserDetail, as: "user_details", },
              { model: OralDoctors, as: "oral_doctors", }
            ]
          }
        }

        User.findOne(query).then((user) => {
          if (user) {
            req.user = user;
            next();
          } else {
            return res.status(403).json({ success: "false", message: message.Auth.NO_USER });
          }
        }).catch(err => {

          return res.status(403).json({
            success: "false",
            message: message.Auth.BAD_REQUEST || err
          });
        })

      } else {
        return res.status(403).json({ success: "false", message: message.Auth.NO_USER });
      }
    }).catch(err => {

      return res.status(403).json({
        success: "false",
        message: message.Auth.BAD_REQUEST || err
      });
    })
  });

};
