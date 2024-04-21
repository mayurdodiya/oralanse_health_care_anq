var { check, validationResult } = require('express-validator');
const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const options = require("../../../../config/options");
const Op = db.Sequelize.Op;
const User = db.users;
const Treatment = db.treatments;
const ClinicTreatment = db.clinic_treatments;
const ClinicTiming = db.clinic_timings;
const ClinicSpeciality = db.clinic_specialities;
const Speciality = db.specialities;
const Clinic = db.clinics;
const Facility = db.facilities;
const ClinicFacility = db.clinic_facilities;

module.exports = {
  getAllHomeVisitClinic: async (data) => {
    let arr1 = []
    var clinicSpeciality = await commonServices.getAll(ClinicSpeciality, { attributes: ["id", "clinic_id"], include: [{ model: Speciality, as: "specialities", attributes: ["id", "name"], where: { name: data.speciality } }] })
    clinicSpeciality.length != 0 && clinicSpeciality.map(i => { arr1.push(i.clinic_id) })
    let arr2 = []
    const clinicTime = await commonServices.getAll(ClinicTiming, {
      attributes: ["clinic_id", "day_of_week", "session_start_time", "session_end_time"],
      where: { day_of_week: data.day, in_clinic_appointment: true, [Op.and]: [{ session_start_time: { [Op.lte]: data.time } }, { session_end_time: { [Op.gte]: data.time } }] }
    })
    clinicTime.length != 0 && clinicTime.map(i => { arr2.push(i.clinic_id) })
    const idArr = arr1.filter(id => arr2.includes(id));
    const clinic = await commonServices.getAndCountAll(Clinic, {
      where: { status: options.ClinicStatus.APPROVE, id: idArr, home_visit: true },
      attributes: ["id", "user_id", "clinic_name", "clinic_type", "clinic_phone_number", "address", "pincode", "bio", "service_24X7", "equipments", "consultation_fees", "clinic_image", "has_NABH", "NABH_certificate_path", "has_iso", "iso_certificate_path", "has_lab", "createdAt"],
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
      ],
      distinct: true
    }, data.limit, data.offset)
    return clinic
  },
};