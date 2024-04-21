const db = require("../../../models");
const jwt = require("jsonwebtoken");
const config = require("../../../config/config.json");
const commonConfig = require("../../../config/common.config");
const emailService = require("../../../services/email");
const adminServices = require("../service");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content")
const emailTmplateServices = require("../../../services/email_template")
const message = require("../message");
const commonResponse = require("./common.response");
const excel = require("exceljs");
const moment = require("moment");
const options = require("../../../config/options");
const Op = db.Sequelize.Op;

const User = db.users;
const UserDetails = db.user_details;



// add subadmin
exports.addSubAdmin = async (req, res) => {
  try {
    const adminId = req.user.id;
    const roleId = 2;
    const password = Math.random().toString(36).slice(-6).toUpperCase();
    const hashPassword = await commonServices.generateHashPassword(password, 8)

    let isEmailUnique = await adminServices.emailExist(req.body.email);
    if (isEmailUnique) {
      let isMobileUnique = await adminServices.phoneExist(req.body.phone_no);

      if (isMobileUnique) {
        const t = await db.sequelize.transaction()

        try {

          const slug = await commonServices.generateSlug(req.body.full_name);
          let userData = await contentServices.createUserProfile({ slug, adminId, roleId, password: hashPassword, ...req.body }, t)
          let userId = userData.user.id;

          await t.commit()

          await commonServices.update(User, { where: { id: userId } }, { createdBy: adminId })
          const context = await emailTmplateServices.getEmailContext({ full_name: req.body.full_name, email: req.body.email })
          await emailTmplateServices.sendEmail({ context: context, email: req.body.email })
          return res.status(200).json({ success: "true", message: message.ADD_DATA("Subadmin") })


        } catch (error) {
          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message })
        }


      } else {
        res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Subadmin") })
      }
    } else {
      res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Subadmin") })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// update subadmin by id
exports.updateSubAdminById = async (req, res) => {
  try {
    const adminId = req.user.id;
    const slug = req.params.slug;

    const user = await commonServices.get(User, { where: { slug: slug } })
    if (user == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Subadmin") })
    }

    const userId = user.id;
    let isEmailExisting = await adminServices.uniqueEmailUpdate(userId, req.body.email);

    if (isEmailExisting) {
      let isMobileExisting = await adminServices.uniquePhoneUpdate(req.body.phone_no, userId);

      if (isMobileExisting) {

        const t = await db.sequelize.transaction()
        try {

          await contentServices.updateUserProfile({ adminId, userId, roleId: 2, ...req.body }, t);
          return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Subadmin profile") })

        } catch (error) {

          await t.rollback()
          return res.status(200).json({ success: "false", message: error.message })
        }


      } else {
        res.status(200).json({ success: "false", message: message.PHONENO_EXIST("Subadmin") })
      }
    } else {
      res.status(200).json({ success: "false", message: message.EMAIL_EXIST("Subadmin") })
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// delete subadmin by id
exports.deleteSubAdminById = async (req, res) => {
  try {

    const slug = req.params.slug;
    let user = await commonServices.get(User, { where: { slug: slug } })
    if (!user) {
      return res.status(200).json({ success: 'false', message: message.NO_DATA("Subadmin") });
    }

    const t = await db.sequelize.transaction();
    try {
      const userId = user.id;
      const data = await contentServices.deleteUserProfile({ userId, roleId: 2 }, t)
      if (data) {
        await t.commit();
        res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Subadmin profile") })
      } else {
        res.status(200).json({ success: "false", message: message.NOT_DELETED("Subadmin profile") })
      }
    } catch (error) {
      t.rollback();
      res.status(200).json({ success: 'false', message: error.message });
    }

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// view subadmin by id
exports.viewSubAdminById = async (req, res) => {
  try {
    const slug = req.params.slug;

    const user = await commonServices.get(User, { where: { slug: slug } })
    if (user == null) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Subadmin") })
    }

    const userId = user.id;
    const data = await contentServices.viewUserProfile({ userId })
    res.status(200).json({ success: "true", message: message.GET_DATA("Subadmin"), data: data })

  } catch (error) {
    res.status(200).json({ success: 'false', message: error.message });
  }

};

// view all user data
exports.viewAllSubAdmin = async (req, res) => {

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
      where: [DataObj, { id: { [Op.ne]: 1 } }, { role_id: 2 }],
      attributes: ["id", "role_id", "slug", "full_name", "email", "countryCode", "phone_no", "profile_image", "is_active", "createdAt"],
      include: [
        { model: UserDetails, as: "user_details", required: false, attributes: ['address1', 'address2', 'age', 'gender'] },
      ]

    };
    let data = await commonServices.getAndCountAll(User, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      responseData.data.map(item => {
        item.profile_image != null ? item.profile_image : null
      })
      res.status(200).json({ success: "true", message: message.GET_DATA("Subadmin"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Subadmin") })
    }
  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// active subadmin status
exports.updateSubAdminStatus = async (req, res) => {
  try {
    const slug = req.params.slug;
    const user = await commonServices.get(User, { where: { slug: slug, } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("User") });
    }

    const userStatus = user.is_active;
    const roleId = user.role_id;
    if (userStatus == true) {
      const status = false
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.STATUS("User") });
    } else {
      const status = true
      await contentServices.changeUserStatus(slug, roleId, status);
      res.status(200).json({ success: "true", message: message.STATUS("User") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};

// export subadmin details in excel sheet
exports.exportSubadminDetailsInExcel = async (req, res) => {
  try {
    // const user = req.user;
    const timeDate = Date.now();
    const filename = `Subadmin-${timeDate}.xlsx`

    const query = {
      where: { role_id: 2 },
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ["full_name", "email", "countryCode", "phone_no", "createdAt", "is_active"],
      include: [
        { model: UserDetails, as: "user_details", attributes: ["gender", "age", "address1"] }
      ]
    }

    const subadminData = await commonServices.getAll(User, query)
    const responseData = JSON.parse(JSON.stringify(subadminData));
    if (responseData.length != 0) {
      let objs = responseData
      objs = objs.map(i => {
        return {
          full_name: i.full_name,
          gender: i.user_details.gender != null ? i.user_details.gender : "",
          age: i.user_details.age != null ? i.user_details.age : "",
          phone_no: `${i.countryCode}${i.phone_no}`,
          email: i.email,
          createdAt: moment(i.createdAt).format(options.DateFormat.DATETIME),
          is_active: i.is_active,
          address1: i.user_details.address1 != null ? i.user_details.address1 : "",
        }
      })

      let workbook = new excel.Workbook();
      let worksheet = workbook.addWorksheet("subadmin");
      worksheet.columns = [
        { header: "Name", key: "full_name", width: 20 },
        { header: "Gender", key: "gender", width: 20 },
        { header: "Age", key: "age", width: 20 },
        { header: "Phone No", key: "phone_no", width: 20 },
        { header: "Email", key: "email", width: 20 },
        { header: "CreatedAt", key: "createdAt", width: 30 },
        { header: "Status", key: "is_active", width: 20 },
        { header: "Address", key: "address1", width: 20 },
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