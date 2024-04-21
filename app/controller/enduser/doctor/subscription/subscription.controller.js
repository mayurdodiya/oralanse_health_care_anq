const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment');
const Op = db.Sequelize.Op;


const User = db.users;
const Clinics = db.clinics;
const Patients = db.patients;
const ClinicStaffs = db.clinic_staffs;
const ClinicTreatments = db.clinic_treatments;
const ClinicStaffAattendances = db.clinic_staff_attendances;
const SubscriptionPlans = db.subscription_plans;



// view all subscription
exports.viewAllSubscription = async (req, res) => {

    try {
  
      let query = {
        where: [],
        attributes: ['id', 'plan_name', 'plan_description', 'features', 'plan_price', 'duration_months', 'is_active'],
      };
  
      let data = await commonServices.getAll(SubscriptionPlans, query)
      if (data) {
        let responseData = JSON.parse(JSON.stringify(data))
        // responseData.map(item => {
        //   item.features = JSON.parse(item.features)
        // }) 
        return res.status(200).json({ success: "true", message: message.GET_DATA("Subscription"), data: responseData })
      } else {
        return res.status(200).json({ success: "false", message: message.NO_DATA("This subscription") })
      }
  
    } catch (error) {
      res.status(200).json({ success: " false", message: error.message })
    }
  
  };
  