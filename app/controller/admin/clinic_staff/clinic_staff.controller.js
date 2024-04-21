const db = require("../../../models");
const jwt = require("jsonwebtoken");
const config = require("../../../config/config.json");
const Op = db.Sequelize.Op;
const { methods: contentServices } = require("../../../services/content");
const adminServices = require("./../service");
const commonServices = require('../../../services/common');
const message = require("../../admin/message");
const emailTmplateServices = require("../../../services/email_template")
const sendAllNotification = require("../../../services/settings");


const User = db.users;
const UserDetails = db.user_details;
const ClinicStaff = db.clinic_staffs;




// Add Staff By final
exports.addStaff = async (req, res) => {
  try {

    let token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, config.SECRET_KEY);
    const adminId = decoded.user_id;
    const roleId = decoded.role_id;
    let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
    await commonServices.get(User, query).then(async admin => {

      if (admin) {

        let isExistingQuery = { where: { email: req.body.email } }
        let isEmailExisting = await commonServices.get(User, isExistingQuery)

        if (isEmailExisting == null) {
          let isMobileExistingQuery = { where: { phone_no: req.body.phone_no } }

          let isMobileExisting = await commonServices.get(User, isMobileExistingQuery)


          if (isMobileExisting == null) {

            db.sequelize.transaction()
              .then(async function (t) {
                const userSlug = commonServices.generateSlug(req.body.full_name);
                let userObj = {
                  role_id: 3,
                  full_name: req.body.full_name,
                  email: req.body.email,
                  slug: userSlug,
                  countryCode: req.body.countryCode,
                  phone_no: req.body.phone_no,
                  profile_image: req.body.profile_image,
                  is_active: false,
                  google_id: req.body.google_id,
                  facebook_id: req.body.facebook_id,
                  createdBy: adminId,
                }
                return commonServices.create(User, userObj, { transaction: t })
                  .then(async function (userData) {
                    let UserDetailsObj = {
                      user_id: userData.id,
                      address1: req.body.address1,
                      address2: req.body.address2,
                      area_id: req.body.area_id,
                      city_id: req.body.city_id,
                      language_id: req.body.language_id,
                      active_profile: "patient",
                      location: req.body.location,
                      latitude: req.body.latitude,
                      longitude: req.body.longitude,
                      createdBy: adminId
                    }
                    return commonServices.create(UserDetails, UserDetailsObj, { transaction: t })
                  })
                  .then(async function (userDetail) {
                    let ClinicStaffObj = {
                      user_id: userDetail.user_id,
                      clinic_id: req.body.clinic_id,
                      position_name: req.body.position_name,
                      duty_start_time: req.body.duty_start_time,
                      duty_end_time: req.body.duty_end_time,
                      present_day: req.body.present_day,
                      createdBy: adminId
                    }

                    return await commonServices.create(ClinicStaff, ClinicStaffObj, { transaction: t })
                  })
                  .then(function () {
                    t.commit();
                    t.afterCommit(async () => {
                      const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
                      await sendAllNotification.sendAllNotification({ email: req.body.email, context })
                      res.status(200).json({ success: "true", message: message.CREATE_CLINIC_STAFF_SUCCESS })
                    });
                  })
                  .catch(function (err) {
                    t.rollback();
                    res.status(200).json({ success: 'false', message: err.message });
                  });
              });
          } else {
            res.status(200).json({ success: "false", message: message.CLINIC_STAFF_PHONE_NO_ALREADY_EXIST })
          }
        } else {
          res.status(200).json({ success: "false", message: message.CLINIC_STAFF_EMAIL_ALREADY_EXIST })
        }
      } else {
        res.status(200).json({ success: "false", message: message.NOT_USER })
      }

    }).catch((err) => {
      res.status(200).json({ success: 'false', message: err.message });
    });

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// Update Staff by id done
exports.updateStaff = async (req, res) => {
  try {

    let token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, config.SECRET_KEY);
    const adminId = decoded.user_id;
    const roleId = decoded.role_id;
    const Slug = req.params.slug;
    let Email = req.body.email;
    let PhoneNo = req.body.phone_no;

    let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
    await commonServices.get(User, query).then(async admin => {

      if (admin) {
        const userData = await commonServices.get(User, { where: { slug: Slug } })
        if (userData != null) {
          const Id = userData.id;
          let isEmailExisting = await adminServices.emailValidationForEdit(Id, Email);

          if (isEmailExisting == true) {
            let isMobileExisting = await adminServices.mobileValidationForEdit(Id, PhoneNo);

            if (isMobileExisting == true) {

              db.sequelize.transaction()
                .then(async function (t) {

                  let userObj = {
                    role_id: 3,
                    full_name: req.body.full_name,
                    email: req.body.email,
                    countryCode: req.body.countryCode,
                    phone_no: req.body.phone_no,
                    profile_image: req.body.profile_image,
                    is_active: false,
                    google_id: req.body.google_id,
                    facebook_id: req.body.facebook_id,
                    updatedBy: adminId,
                  }
                  return await commonServices.update(User, { where: { id: Id } }, userObj, { transaction: t })
                    .then(async function (userData) {

                      let UserDetailObj = {
                        user_id: userData.id,
                        address1: req.body.address1,
                        address2: req.body.address2,
                        area_id: req.body.area_id,
                        city_id: req.body.city_id,
                        language_id: req.body.language_id,
                        location: req.body.location,
                        latitude: req.body.latitude,
                        longitude: req.body.longitude,
                        updatedBy: adminId
                      }
                      return await commonServices.update(UserDetails, { where: { user_id: Id } }, UserDetailObj, { transaction: t })
                    })
                    .then(async function (UserDetail) {
                      let ClinicStaffObj = {
                        user_id: UserDetail.user_id,
                        clinic_id: req.body.clinic_id,
                        position_name: req.body.position_name,
                        duty_start_time: req.body.duty_start_time,
                        duty_end_time: req.body.duty_end_time,
                        present_day: req.body.present_day,
                        updatedBy: adminId,
                      }
                      return await commonServices.update(ClinicStaff, { where: { user_id: Id } }, ClinicStaffObj, { transaction: t })
                    })
                    .then(function () {
                      t.commit();
                      t.afterCommit(() => {
                        res.status(200).json({ success: "true", message: message.CLINIC_STAFF_UPDATE_SUCCESS })
                      });
                    })
                    .catch(function (err) {
                      t.rollback();
                      res.status(200).json({ success: 'false', message: err.message });
                    });
                });
            } else {
              res.status(200).json({ success: "false", message: message.CLINIC_STAFF_PHONE_NO_ALREADY_EXIST })
            }
          } else {
            res.status(200).json({ success: "false", message: message.CLINIC_STAFF_EMAIL_ALREADY_EXIST })
          }
        } else {
          res.status(200).json({ success: "false", message: message.CLINIC_STAFF_NOT_EXIST })
        }
      } else {
        res.status(200).json({ success: "false", message: message.NOT_USER })
      }

    }).catch((err) => {
      res.status(200).json({ success: 'false', message: err.message });
    });

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// delete Clinic Staff done
exports.deleteClinicStaffById = async (req, res) => {
  try {

    let token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, config.SECRET_KEY);
    const adminId = decoded.user_id;
    const roleId = decoded.role_id;
    const Slug = req.params.slug;

    let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
    await commonServices.get(User, query).then(async admin => {

      if (admin) {
        let user = await commonServices.get(User, { where: { slug: Slug } })
        if (user != null) {
          const Id = user.id;
          let isExisting = await commonServices.get(User, { where: { id: Id } })

          if (isExisting != null) {
            db.sequelize.transaction()
              .then(async function (t) {

                return await commonServices.delete(User, { where: { id: Id } }, { transaction: t })

                  .then(async function (userData) {
                    return commonServices.delete(UserDetails, { where: { user_id: Id } }, { transaction: t })
                  })

                  .then(async function (userDetails) {
                    let deleteDoctorData = await commonServices.delete(ClinicStaff, { where: { user_id: Id } }, { transaction: t })
                    return deleteDoctorData
                  })
                  .then(function (deleteDoctorData) {

                    if (deleteDoctorData == 1) {
                      t.commit();
                      t.afterCommit(() => {
                        res.status(200).json({ success: "true", message: message.CLINIC_STAFF_DELETED_SUCCESS })
                      });

                    } else {
                      res.status(200).json({ success: "false", message: message.NOT_DELETED })
                    }
                  })
                  .catch(function (err) {
                    t.rollback();
                    res.status(200).json({ success: 'false', message: err.message });
                  });
              });
          } else {
            res.status(200).json({ success: "false", message: message.CLINIC_STAFF_IS_ALREADY_DELETED });
          }
        } else {
          res.status(200).json({ success: "false", message: message.CLINIC_STAFF_NOT_EXIST });
        }
      } else {
        res.status(200).json({ success: "false", message: message.NOT_USER })
      }

    }).catch((err) => {
      res.status(200).json({ success: 'false', message: err.message });
    });

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// View By Clinic Staff Id done
// exports.viewClinicStaffById = async (req, res) => {

//   try {

//     let token = req.headers["x-access-token"];
//     const decoded = jwt.verify(token, config.SECRET_KEY);
//     const adminId = decoded.user_id;
//     const roleId = decoded.role_id;
//     const Slug = req.params.slug;

//     let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
//     let checkAdmin = await commonServices.get(User, query)
//     if (checkAdmin) {
//       const userData = await commonServices.get(User, { where: { slug: Slug } });
//       if (userData != null) {
//         const Id = userData.id;

//         let Query = {
//           where: { id: Id },
//           attributes: ['id', 'slug', 'first_name', 'last_name', 'email', 'country_code', 'phoneno', 'profile_image', 'wallet_balance', 'is_active'],
//           include: [
//             { model: UserDetails, as: "user_details", attributes: ['address1', 'address2', 'city', 'state', 'country'] },
//             { model: ClinicStaff, as: "clinic_staffs", attributes: ['clinic_id', 'position_name'] }
//           ]
//         }
//         let viewUserData = await commonServices.get(User, Query);

//         if (viewUserData != null) {
//           res.status(200).json({
//             success: "true",
//             message: message.GET_CLINIC_STAFF_DATA_SUCCESSFULLY,
//             data: commonResponse.logInRes(viewUserData.id, viewUserData.slug, viewUserData.first_name, viewUserData.last_name, viewUserData.email, viewUserData.country_code, viewUserData.phoneno, viewUserData.profile_image != null ? viewUserData.profile_image = `${commonConfig.url}${viewUserData.profile_image}` : null, viewUserData.wallet_balance, viewUserData.is_active, viewUserData.user_details.address1, viewUserData.user_details.address2, viewUserData.user_details.city, viewUserData.user_details.state, viewUserData.user_details.country)
//           })
//         } else {
//           res.status(200).json({
//             success: "false",
//             message: message.CLINIC_STAFF_NOT_EXIST
//           });
//         }

//       } else {
//         res.status(200).json({
//           success: "false",
//           message: message.CLINIC_STAFF_NOT_EXIST
//         });
//       }
//     } else {
//       res.status(200).json({ success: "false", message: message.NOT_USER })
//     }

//   } catch (error) {
//     res.status(200).json({
//       success: " false",
//       message: error.message
//     })
//   }

// };
exports.viewClinicStaffById = async (req, res) => {

  try {

    let token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, config.SECRET_KEY);
    const adminId = decoded.user_id;
    const roleId = decoded.role_id;
    const Slug = req.params.slug;

    let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
    let Admin = await commonServices.get(User, query)
    if (Admin) {
      let viewQuery = { where: { slug: Slug } }
      let user = await commonServices.get(User, viewQuery);

      if (user != null) {
        const Id = user.id;

        const query = {
          where: { user_id: Id },
          attributes: ["user_id", "clinic_id", "position_name", "duty_start_time", "duty_end_time", "present_day"],
          include: [
            {
              model: User, as: "users", attributes: ["id", "slug", "email", "full_name", "countryCode", "phone_no", "profile_image", "is_active", "google_id", "facebook_id",],
              include: [
                { model: UserDetails, as: "user_details", attributes: ["user_id", "address1", "address2", "area_id", "city_id", "language_id", "active_profile", "location", "latitude", "longitude"] }
              ]
            },
          ]
        }

        let user = await commonServices.get(ClinicStaff, query);
        if (user != null) {

          res.status(200).json({
            success: "true",
            message: message.GET_CLINIC_STAFF_DATA_SUCCESSFULLY,
            data: user
          })
        } else {
          res.status(200).json({
            success: "false",
            message: message.CLINIC_STAFF_NOT_EXIST
          })
        }
      } else {
        res.status(200).json({
          success: "false",
          message: message.CLINIC_STAFF_NOT_EXIST
        });
      }
    } else {
      res.status(200).json({ success: "false", message: message.NOT_USER })
    }

  } catch (error) {
    res.status(200).json({
      success: " false",
      message: error.message
    })
  }

};

exports.viewAllClinicStaff = async (req, res) => {

  try {

    let token = req.headers["x-access-token"];
    const decoded = jwt.verify(token, config.SECRET_KEY);
    const adminId = decoded.user_id;
    const roleId = decoded.role_id;
    const { page, size, s } = req.query;

    let query = { where: [{ id: adminId }, { role_id: roleId }, { is_active: 1 }] }
    let Admin = await commonServices.get(User, query)
    if (Admin) {
      let getallDataObj = {};
      if (s) {
        getallDataObj = {
          ...getallDataObj,
          [Op.or]: [

            { '$users.full_name$': { [Op.like]: `%${s}%` } },
            { '$users.email$': { [Op.like]: `%${s}%` } },
            { '$users.slug$': { [Op.like]: `%${s}%` } },
            { '$users.phone_no$': { [Op.like]: `%${s}%` } }
          ]
        }
      }

      const { limit, offset } = commonServices.getPagination(page, size);

      const query = {
        where: [getallDataObj],
        attributes: ["user_id", "clinic_id", "position_name", "duty_start_time", "duty_end_time", "present_day"],
        include: [
          {
            model: User, as: "users", attributes: ["id", "slug", "email", "full_name", "countryCode", "phone_no", "profile_image", "is_active", "google_id", "facebook_id",],
            include: [
              { model: UserDetails, as: "user_details", attributes: ["user_id", "address1", "address2", "area_id", "city_id", "language_id", "active_profile", "location", "latitude", "longitude"] }
            ]
          },
        ]
      }

      let Data = await commonServices.getAndCountAll(ClinicStaff, query, limit, offset)
      if (Data) {
        const response = commonServices.getPagingData(Data, page, limit);
        let responseData = JSON.parse(JSON.stringify(response))


        res.status(200).json({
          success: "true",
          message: message.GET_CLINIC_STAFF_DATA_SUCCESSFULLY,
          data: responseData
        });

      } else {
        res.status(200).json({ success: "false", message: message.CLINIC_STAFF_NOT_EXIST })
      }
    } else {
      res.status(200).json({ success: "false", message: message.NOT_USER })
    }

  } catch (error) {
    res.status(200).json({
      success: " false",
      message: error.message
    })
  }

};