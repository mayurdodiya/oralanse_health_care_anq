const db = require('../models');
const { Sequelize } = require('../models');
const { methods: commonServices } = require("./common");
const _ = require("lodash");
const message = require("./message");
const moment = require("moment");
const options = require("../config/options");
const bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;

const Beds = db.beds;
const User = db.users;
const UserDetails = db.user_details;
const Clinic = db.clinics;
const LabTest = db.lab_tests;
const ClinicSpeciality = db.clinic_specialities;
const ClinicTiming = db.clinic_timings;
const ClinicFacility = db.clinic_facilities;
const Speciality = db.specialities;
const Facility = db.facilities;
const UserReview = db.user_reviews;
const LabTestPatients = db.lab_test_patients;
const LabTestClinics = db.lab_test_clinics;


const methods = {
  getAllLabClinics: async (data) => {
    let arr1 = []
    var clinicLabTest = await commonServices.getAll(LabTestClinics, { where: { lab_test_id: data.testId }, attributes: ["id", "clinic_id"] })
    clinicLabTest.length != 0 && clinicLabTest.map(i => { arr1.push(i.clinic_id) })
    let arr2 = []
    const clinicTime = await commonServices.getAll(ClinicTiming, {
      attributes: ["clinic_id", "day_of_week", "session_start_time", "session_end_time"],
      where: { day_of_week: data.day, in_clinic_appointment: true, [Op.and]: [{ session_start_time: { [Op.lte]: data.time } }, { session_end_time: { [Op.gte]: data.time } }] }
    })

    
    clinicTime.length != 0 && clinicTime.map(i => { arr2.push(i.clinic_id) })
    const idArr = arr1.filter(id => arr2.includes(id));
    const clinic = await commonServices.getAndCountAll(Clinic, {
      where: { status: options.ClinicStatus.APPROVE, id: idArr, has_lab: true },
      attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_phone_number", "address", "pincode", "bio", "service_24X7", "rating_point", "equipments", "consultation_fees", "clinic_image", "createdAt"],
      include: [
        { model: User, as: "users", attributes: ["slug"] },
        { model: ClinicTiming, as: "clinic_timings", attributes: ["day_of_week", "session_start_time", "session_end_time"] },
        {
          model: ClinicSpeciality, as: "clinic_specialities", attributes: ["id"],
          include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], }]
        },
        {
          model: ClinicFacility, as: "clinic_facilities", required: false,
          include: [{ model: Facility, as: "facilities", attributes: ["id", "name"] }]
        },
        { model: UserReview, as: "clinicReview", required: false, attributes: ["id"] },
        { model: Beds, as: "clinicBed", required: false, attributes: ["id"] },
        { model: LabTestClinics, as: "clinicLabTest", required: false, attributes: ["id", "lab_test_id", "price"], include: [{ model: LabTest, as: "lab_tests", attributes: ["category", "sub_category", "name"] }] }
      ],
      distinct: true
    }, data.limit, data.offset)
    return clinic
  }
}

module.exports = { methods }
