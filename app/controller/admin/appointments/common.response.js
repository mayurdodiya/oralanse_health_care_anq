const db = require("../../../models");
const moment = require("moment");
module.exports = {
  logResponse: (responseData, creationTime) => {
    const log = responseData.data.map(item => {
      id = item.id

    })
    return (response = {
      id: log
    });
  },

  modifyAppointment: (response) => {
    const obj = response.map(item => {
      return {
        id: item.id,
        appointment_type: item.appointment_type,
        patient_id: item.patient_id,
        status: item.status,
        slot_timing: item.slot_timing,
        treatment_id: item.treatment_id,
        speciality_id: item.speciality_id,
        createdAt: item.createdAt,
        patientdata: item.patientdata,
        treatment_for: item.treatmentdata != null ? item.treatmentdata.name : item.specialitydata.name,
        doctor_data: item.doctors != null ? {
          id: item.doctors.id,
          user_id: item.doctors.user_id,
          doctor_type: item.doctors.doctor_type,
          prefix: item.doctors.prefix,
          full_name: item.doctors.users.full_name,
          experience: item.doctors.experience,
          profile_image: item.doctors.users.profile_image,
          doctor_specialities: item.doctors.doctor_specialities
        } : null,
        clinic_data: item.clinicdata != null ? {
          id: item.clinicdata.id,
          user_id: item.clinicdata.user_id,
          clinic_name: item.clinicdata.clinic_name,
          clinic_type: item.clinicdata.clinic_type,
          clinic_image: item.clinicdata.clinic_image,
          clinic_specialities: item.clinicdata.clinic_specialities
        } : null
      }
    })
    return obj
  }
};