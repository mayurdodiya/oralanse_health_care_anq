const consultationController = require("../../../controller/enduser/patient/consultation/consultation.controller");
const consultationServices = require("../../../controller/enduser/patient/consultation/service");

const multer = require('multer');
const authJwt = require("../../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept",
    );
    next();
  });

  app.get("/api/user/specialitytreatment", [authJwt.verifyUserToken], consultationController.getAllSpecialityAndTreatment)
  app.get("/api/speciality", [authJwt.verifyUserToken], consultationController.getAllSpecialities);
  app.get("/api/treatment", [authJwt.verifyUserToken], consultationController.getAllTreatment);
  app.get("/api/promocode", [authJwt.verifyUserToken], consultationController.getPromocodeList);
  app.post("/api/user/appointment", [authJwt.verifyUserToken], consultationServices.addBookAppointmentValidation, consultationController.bookAppointment);
  app.get("/api/user/doctor", [authJwt.verifyUserToken], consultationController.getDoctorList);
  app.get("/api/user/doctor/:slug", [authJwt.verifyUserToken], consultationController.viewDoctorById);
  app.get("/api/user/clinic", [authJwt.verifyUserToken], consultationController.getHospitalList);
  app.get("/api/user/clinic/:slug", [authJwt.verifyUserToken], consultationController.viewHospitalById);
  app.get("/api/patient/appointment", [authJwt.verifyUserToken], consultationController.viewConsultationRequestList);
  app.get("/api/patient/appointment/:id", [authJwt.verifyUserToken], consultationController.viewConsultationRequestById);
  app.get("/api/patient/appointmentstatus/:id", [authJwt.verifyUserToken], consultationController.rescheduleOrCancelRequest);
  app.post("/api/patient/appointmentpayment", [authJwt.verifyUserToken], consultationController.createAppointmentPayment);
  app.post("/api/patient/verifypayment", [authJwt.verifyUserToken], consultationController.verifyAppointmentPayment);
  app.post("/api/patient/review", [authJwt.verifyUserToken], consultationController.addReview);
  app.get("/api/patient/viewreview", [authJwt.verifyUserToken], consultationController.getDoctorOrClinicReview);
  app.post("/api/patient/addondoctor/:id", [authJwt.verifyUserToken], consultationController.sendAddOnRequest);
  app.get("/api/patient/addondoctor/:id", [authJwt.verifyUserToken], consultationController.getAllAddonDoctorList);
  app.get("/api/patient/prescriptiondoc/:id", [authJwt.verifyUserToken], consultationController.getAllPrescriptionDoc);
  app.get("/api/patient/viewprescription/:id", [authJwt.verifyUserToken], consultationController.viewPrescriptionDocumentDetails);
  app.get("/api/patient/treatment/:id", [authJwt.verifyUserToken], consultationController.viewTreatmentById);
  app.get("/api/patient/medicine/:id", [authJwt.verifyUserToken], consultationController.viewMedicineById);
  app.get("/api/patient/pastappointment", [authJwt.verifyUserToken], consultationController.viewAppointmentPastHistory);
  app.get("/api/user/adminfees", [authJwt.verifyUserToken], consultationController.viewConsultaionFees);
  app.get("/api/user/paymentkey", [authJwt.verifyUserToken], consultationController.getRazorPayAndPaypalKey);
  app.post("/api/patient/transcription/:id", [authJwt.verifyUserToken], consultationController.createTranscriptionSummary);


};
