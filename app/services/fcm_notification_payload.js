const db = require('../models');

module.exports = {

  blogPayLoad: (data) => {
    var payload = {};
    // payload.userId = data.userId;
    payload.status = 'all';
    payload.title = "Blog!";
    payload.body = 'you have been got new blog!';
    payload.topicName = 'blogs_update!';
    payload.redirect_action = 'ADMIN_BLOG';
    return payload
  },

  coWorkingSpaceRequest: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Co-working space request!";
    payload.body = 'you have got co-working space request!';
    payload.redirect_action = 'CLINIC_COWORKINGSPACE';
    return payload
  },

  bookAppointment: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment request!";
    payload.body = 'you have got appointment request!';
    payload.redirect_action = 'ALL_BOOKAPPOINTMENT';  // <-- for all
    return payload
  },

  acceptAndDeclineAppointmentRequest: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment request!";
    payload.body = `your appointment request has been ${data.body}!`;
    payload.redirect_action = 'CLINIC_DOCTOR_APPOINTMENTSTATUS';
    return payload
  },

  addSuggested: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment!";
    payload.body = `you got suggested ${data.body}!`;
    payload.redirect_action = 'DOCTOR_CLINIC_SUGGESTEDTREATMENTMEDICINEAll';
    return payload
  },

  appointmentStatus: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment!";
    payload.body = `your appointment has been move in to ${data.body} status!`;
    payload.redirect_action = 'PATIENT_APPOINTMENTSTATUS';
    return payload
  },

  clinicAcceptAndDeclineAppointmentRequest: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment request!";
    payload.body = `your appointment request has been ${data.body}!`;
    payload.redirect_action = 'CLINIC_APPOINTMENTSTATUS';
    return payload
  },

  clinicAssignNurseToPateint: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment request!";
    payload.body = `you are assign to patient!`;
    payload.redirect_action = 'CLINIC_NURSEASSIGNTOPATIENT';
    return payload
  },

  clinicAppointmentStatus: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Appointment!";
    payload.body = `your appointment has been move in to ${data.body} status!`;
    payload.redirect_action = 'CLINIC_APPOINTMENTSTATUS';
    return payload
  },

  approveAndDisapproveDoctorProfile: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Profile!";
    payload.body = `your doctor profile has been ${data.body}!`;
    payload.redirect_action = 'ADMIN_DOCTORPROFILEAPPROVE';
    return payload
  },

  approveAndDisapproveClinicProfile: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Profile!";
    payload.body = `your clinic profile has been ${data.body}!`;
    payload.redirect_action = 'ADMIN_CLINICPROFILEAPPROVE';
    return payload
  },

  activeAndDisactiveClinicProfile: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Profile!";
    payload.body = `your clinic profile has been ${data.body}!`;
    payload.redirect_action = 'ADMIN_CLINICPROFILEACTIVE';
    return payload
  },

  activeAndDisactiveDoctorProfile: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Profile!";
    payload.body = `your clinic profile has been ${data.body}!`;
    payload.redirect_action = 'ADMIN_DOCTORPROFILEACTIVE';
    return payload
  },
  getAmbulanceRequest: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Ambulance request!";
    payload.body = `you have find new ambulance request!`;
    payload.redirect_action = 'CLINIC_AMBULANCEREQUEST';
    return payload
  },
  acceptAndDeclineAmbulanceRequest: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Ambulance request!";
    payload.body = `your ambulance request has been ${data.body}!`;
    payload.redirect_action = 'PATIENT_AMBULANCEREQUESTACCEPTDECLINE';
    return payload
  },
  orderGenerated: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Order!";
    payload.body = `your order has been generate successfully!`;
    payload.redirect_action = 'ALL_ORDERGENERATED';
    return payload
  },
  orderStatus: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Order!";
    payload.body = `your order is ${data.body}!`;
    payload.redirect_action = 'ALL_ORDERSTATUSBYADMIN';
    return payload
  },
  staffSchedulingDuty: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Hr department!";
    payload.body = `your scheduling duty added by hr department!`;
    payload.redirect_action = 'CLINIC_ADDSCHEDULINGDUTY';
    return payload
  },
  adminOrders: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Order!";
    payload.body = `you have new order from ${data.body}!`;
    payload.redirect_action = 'ADMIN_ORDERS';
    return payload
  },

  pharmacyOrderAcceptDeclineComplete: (data) => {
    var payload = {};
    payload.userId = data.userId;
    payload.status = 'user';
    payload.title = "Pharmacy Orders!";
    payload.body = `your medicine request has been ${data.body} from pharmacy!`;
    payload.redirect_action = 'CLINIC_PHARMACY_ORDERS'; // request send to patient from hospital
    return payload
  },

}