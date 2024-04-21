const db = require("../../../models");
const jwt = require("jsonwebtoken");
const config = require("../../../config/config.json");
const adminServices = require("../service");
const { methods: commonServices } = require('../../../services/common');
const emailService = require("../../../services/email");
const emailTmplateServices = require("../../../services/email_template")
const sendAllNotification = require("../../../services/settings");
const message = require("../../admin/message");
const commonResponse = require("./common.response");
const commonConfig = require("../../../config/common.config");
const excel = require("exceljs");
const moment = require("moment");
const options = require("../../../config/options");


const Op = db.Sequelize.Op;
const { methods: contentServices } = require("../../../services/content")
const User = db.users;
const UserDetails = db.user_details;
const Areas = db.areas;
const Cities = db.cities;


// add user
exports.addUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    let isEmailUnique = await adminServices.emailExist(req.body.email);

    if (isEmailUnique) {
      let isMobileUnique = await adminServices.phoneExist(req.body.phone_no);

      if (isMobileUnique) {
        const t = await db.sequelize.transaction()

        try {

          const slug = await commonServices.generateSlug(req.body.full_name);
          let userData = await contentServices.createUserProfile({ slug, adminId, ...req.body }, t)
          let userId = userData.user.id;

          await t.commit()

          await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
          const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
          await sendAllNotification.sendAllNotification({ email: req.body.email, context })
          return res.status(200).json({ success: "true", message: message.ADD_DATA("User") })


        } catch (error) {

          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message })
        }


      } else {
        res.status(200).json({ success: "false", message: message.PHONENO_EXIST("User") })
      }
    } else {
      res.status(200).json({ success: "false", message: message.EMAIL_EXIST("User") })
    }

  } catch (error) {

    res.status(200).json({ success: 'false', message: error.message });
  }

};

// update user by id
exports.updateUserById = async (req, res) => {
  try {
    const adminId = req.user.id;
    const slug = req.params.slug;

    const user = await commonServices.get(User, { where: { slug: slug } })
    if (user == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }

    const userId = user.id;
    let isEmailExisting = await adminServices.uniqueEmailUpdate(userId, req.body.email);

    if (isEmailExisting) {
      let isMobileExisting = await adminServices.uniquePhoneUpdate(req.body.phone_no, userId);

      if (isMobileExisting) {

        const t = await db.sequelize.transaction()
        try {

          await contentServices.updateUserProfile({ adminId, userId, roleId: 3, ...req.body }, t);
          return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("User profile") })

        } catch (error) {

          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message })
        }


      } else {
        res.status(200).json({ success: "false", message: message.PHONENO_EXIST("User") })
      }
    } else {
      res.status(200).json({ success: "false", message: message.EMAIL_EXIST("User") })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// delete user by id pending*****
exports.deleteUserById = async (req, res) => {
  // try {

  //   const slug = req.params.slug;
  //   let user = await commonServices.get(User, { where: { slug: slug } })
  //   if (!user) {
  //     return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
  //   }

  //   const userId = user.id;
  //   let patientData = await commonServices.get(Patient, { where: { user_id: userId } })
  //   if (!patientData) {
  //     return res.status(200).json({ success: "false", message: message.NO_DATA("Patient profile") });
  //   }
  //   const patientId = patientData.id

  //   const t = await db.sequelize.transaction()
  //   try {

  //     const userDelete = await contentServices.deleteUserProfile({ userId, patientId }, t)
  //
  //     if (userDelete) {
  //       await t.commit()
  //       return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Patient profile") })
  //     } else {
  //       res.status(200).json({ success: "false", message: message.NOT_DELETED("Patient profile") });
  //     }

  //   } catch (error) {
  //     await t.rollback()
  //     return res.status(200).json({ success: 'false', message: error.message })
  //   }

  // } catch (error) {
  //   res.status(200).json({ success: 'false', message: error.message });
  // }
};

// view user by id
exports.viewUserById = async (req, res) => {
  try {
    const slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: slug } });
    if (user != null) {
      const userId = user.id;

      const query = {
        where: { id: userId },
        attributes: ["id", "slug", "full_name", "email", "countryCode", "phone_no", "profile_image", "is_active", "createdAt"],
        include: [
          {
            model: UserDetails, as: "user_details", attributes: ["address1", "address2", "pincode"],
            include: [
              {
                model: Areas, as: "areas", required: false, attributes: ["id", "pincode"],
                include: [
                  { model: Cities, as: "cities", required: false, attributes: ["id", "city_name", "state_name", "country_name"] },
                ]
              },
            ]
          },
        ]
      }


      let data = await commonServices.get(User, query);
      const modifyDate = data.createdAt
      let jsonData = commonResponse.logInRes(data, modifyDate)

      if (data) {
        res.status(200).json({
          success: "true",
          message: message.GET_DATA("User profile"),
          data: jsonData
          // data: data
        })
      } else {
        res.status(200).json({ success: "false", message: message.NO_DATA("User") })
      }

    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all user data
exports.viewAllUserData = async (req, res) => {

  try {

    const { page, size, s } = req.query;
    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { full_name: { [Op.like]: `%${s}%` } },
          { email: { [Op.like]: `%${s}%` } },
          { phone_no: { [Op.like]: `%${s}%` } },
          { countryCode: { [Op.like]: `%${s}%` } }
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);

    const query = {
      where: [DataObj, { id: { [Op.ne]: 1 } }],
      attributes: ["id", "slug", "full_name", "email", "countryCode", "phone_no", "profile_image", "is_active", "createdAt"],
      include: [
        { model: UserDetails, as: "user_details", required: false, attributes: ['address1', 'address2'] },
      ]

    };
    let data = await commonServices.getAndCountAll(User, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      responseData.data.map(item => {
        item.profile_image != null ? item.profile_image : null;
      })
      res.status(200).json({
        success: "true",
        message: message.GET_DATA("User"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("User") })
    }


  } catch (error) {
    res.status(200).json({
      success: " false",
      message: error.message
    })
  }

};

// create userdata excel file from database
exports.exportUserDetailsInExcel = async (req, res) => {
  try {
    const user = req.user;
    const timeDate = Date.now();
    const filename = `${timeDate}.xlsx`

    const query = {
      where: { role_id: { [Op.ne]: 1 } },
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ["full_name", "email", "countryCode", "phone_no", "createdAt", "is_active"],
      include: [
        { model: UserDetails, as: "user_details", attributes: ['gender', 'age'] }
      ]
    }

    const userData = await commonServices.getAll(User, query)
    const responseData = JSON.parse(JSON.stringify(userData));
    if (responseData.length != 0) {
      let objs = responseData
      objs = objs.map(i => {
        return {
          full_name: i.full_name,
          phone_no: `${i.countryCode}${i.phone_no}`,
          email: i.email,
          createdAt: moment(i.createdAt).format(options.DateFormat.DATETIME),
          is_active: i.is_active,
          gender: i.user_details.gender != null ? i.user_details.gender : "",
          age: i.user_details.age != null ? i.user_details.age : ""
        }
      })

      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("userdetails");
      worksheet.columns = [
        { header: "Name", key: "full_name", width: 20 },
        { header: "Gender", key: "gender", width: 20 },
        { header: "Age", key: "age", width: 20 },
        { header: "Phone No", key: "phone_no", width: 20 },
        { header: "Email", key: "email", width: 20 },
        { header: "CreatedAt", key: "createdAt", width: 30 },
        { header: "Status", key: "is_active", width: 20 }
      ];
      worksheet.addRows(objs);
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${filename}`
      );

      workbook.xlsx.write(res).then(() => {
        res.end()
      });
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("User's data") })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

// active user status
exports.updateUserStatus = async (req, res) => {
  try {

    const roleId = 3;
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("User") });
    } else {
      const status = true
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("User") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};