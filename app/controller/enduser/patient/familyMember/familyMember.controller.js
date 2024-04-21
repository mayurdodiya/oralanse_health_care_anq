const db = require("../../../../models");
const jwt = require("jsonwebtoken");
const { methods: commonServices } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const endUserServices = require("../../services");

const message = require("../../message");
const Patient = db.patients;
const PatientInsurance = db.patient_insurances;
const Area = db.areas;
const City = db.cities;


//Add family member
exports.addFamilyMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const t = await db.sequelize.transaction();
    try {
      const memberExist = await endUserServices.familyMemberExist(req.body.email, req.body.phone_no, userId, req.body.relationship)
      if (memberExist) {
        const userData = await contentServices.createPatientProfile({ userId, ...req.body }, t)
        await contentServices.createOrUpdateUserInsurance({ userId, patientId: userData.id, ...req.body }, t)
        if (userData) {
          await t.commit()
          const response = JSON.parse(JSON.stringify(userData))
          return res.status(200).json({ success: "true", message: message.ADD_DATA("Family member"), data: response })
        } else {
          return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Family member") })
        }
      } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Family member") }) }
    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
};

//view family member profile
exports.viewMemberProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const memberId = req.params.memberId
    const memberData = await commonServices.get(Patient, {
      where: { unique_id: memberId, user_id: userId },
      attributes: { exclude: ["createdBy", "updatedBy", "deletedAt", "createdAt", "updatedAt", "reward_balance", "cash_balance"] },
      include: [{
        model: Area, as: "pincodeData", required: false, attributes: ["city_id", "name", "pincode"],
        include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }]
      }, { model: PatientInsurance, as: "patient_insurance", required: false, attributes: ["company_name", "policy_number", "policy_name", "policy_doc", "insurance_type", "max_amount"] }]
    })
    if (!memberData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Family member") })
    }
    const response = JSON.parse(JSON.stringify(memberData))
    return res.status(200).json({ success: "true", message: message.GET_PROFILE("Family member"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
};

//edit member profile
exports.editMemberProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberId = req.params.memberId;
    const memberData = await commonServices.get(Patient, {
      where: { unique_id: memberId, user_id: userId },
      attributes: { exclude: ["createdBy", "updatedBy", "deletedAt", "createdAt", "updatedAt", "reward_balance", "cash_balance"] },
      include: [{
        model: PatientInsurance, as: "patient_insurance", required: false, attributes: ["company_name", "policy_number", "policy_name", "policy_doc", "insurance_type", "max_amount"]
      }]
    })
    if (!memberData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Family member") })
    }
    const memberExist = await endUserServices.uniqueFamilyMemberUpdate({ userId, unique_id: memberId, ...req.body })
    if (memberExist) {
      const t = await db.sequelize.transaction()
      try {
        await contentServices.updatePatientProfile({ userId, unique_id: memberId, ...req.body }, t)
        await contentServices.createOrUpdateUserInsurance({ userId, patientId: memberData.id, ...req.body }, t)
        await t.commit()
        return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Family member profile") })
      } catch (error) {
        await t.rollback()
        return res.status(200).json({ success: "false", message: error.message })
      }
    } else { res.status(200).json({ success: "false", message: message.DATA_EXIST("Phone number") }) }
  } catch (error) {
    res.status(200).json({
      success: "false",
      message: error.message
    })
  }
};

//get all members
exports.getAllMembers = async (req, res) => {
  try {
    
    const userId = req.user.id;
    const { page, size } = req.query;
    
    const query = {
      where: { user_id: userId },
      attributes: ["id", "unique_id", "full_name", "email", "countryCode", "phone_no", "profile_image", "address1", "address2", "pincode", "gender", "age", "relationship"],
      include: [{
        model: Area, as: "pincodeData", required: false, attributes: ["city_id", "name", "pincode"],
        include: [{ model: City, as: "cities", attributes: ["city_name", "state_name", "country_name"] }]
      }]
    }
    
    const { limit, offset } = commonServices.getPagination(page, size)
    const responseData = await commonServices.getAndCountAll(Patient, query, limit, offset)
    const getPagingData = commonServices.getPagingData(responseData, page, limit)
    const memberData = JSON.parse(JSON.stringify(getPagingData))
    return res.status(200).json({ success: "true", message: message.GET_LIST("Family member"), data: memberData })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//delete member detail
exports.deleteMember = async (req, res) => {
  try {
    const userId = req.user.id
    const memberId = req.params.memberId
    const memberData = await commonServices.get(Patient, {
      where: { unique_id: memberId, user_id: userId },
    })
    if (!memberData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Family member") })
    }
    const t = await db.sequelize.transaction()
    try {
      await commonServices.delete(Patient, { where: { id: memberData.id } }, { transaction: t })
      await commonServices.delete(PatientInsurance, { where: { patient_id: memberData.id } }, { transaction: t })
      await t.commit()
      return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Family member profile") })
    } catch (error) {
      await t.rollback()
      return res.status(200).json({ success: "false", message: error.message })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}
