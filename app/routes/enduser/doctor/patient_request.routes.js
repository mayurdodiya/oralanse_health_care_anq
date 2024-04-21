const patientRequestController = require("../../../controller/enduser/doctor/patient_request/patient_request.controller.js");
const patientRequestServices = require("../../../controller/enduser/doctor/patient_request/service.js");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/doctor/status/:id", [authJwt.verifyDoctorToken], patientRequestController.changeRequestStatusByid);
  app.get("/api/doctor/requestdetails/:id", [authJwt.verifyDoctorToken], patientRequestController.viewConsultationRequestById);
  app.get("/api/doctor/pasthistory/:slug", [authJwt.verifyDoctorToken], patientRequestController.viewPatientPastHistoryListing);
  app.post("/api/doctor/suggestedtreatment/:id", [authJwt.verifyDoctorToken], patientRequestController.addSuggestedTreatment);
  app.delete("/api/doctor/suggestedtreatment/:id", [authJwt.verifyDoctorToken], patientRequestController.deleteTreatment);
  app.post("/api/doctor/suggestedmedicine/:id", [authJwt.verifyDoctorToken], patientRequestController.addSuggestedMedicine);
  app.post("/api/doctor/appointment/hrbilling/:id", [authJwt.verifyDoctorToken], patientRequestController.addHrBilling);
  app.delete("/api/doctor/appointment/hrbilling/:id", [authJwt.verifyDoctorToken], patientRequestController.deleteHrBilling);

  app.post("/api/doctor/appointment/paymenthistory/:id", [authJwt.verifyDoctorToken], patientRequestController.addPaymentHistory);
  app.delete("/api/doctor/appointment/paymenthistory/:id", [authJwt.verifyDoctorToken], patientRequestController.deletePaymentHistory);

  app.delete("/api/doctor/suggestedmedicine/:id", [authJwt.verifyDoctorToken], patientRequestController.deleteSuggestedMedicine);
  app.post("/api/doctor/suggestedlabtest/:id", [authJwt.verifyDoctorToken], patientRequestController.addsuggestedLabsTest);
  app.post("/api/doctor/newlabreport/:id", [authJwt.verifyDoctorToken], patientRequestController.addNewLabReport);
  app.get("/api/labclinic", patientRequestController.clinicListingOfOwnLab);
  app.get("/api/cliniclablisting/:id", patientRequestController.getClinicAllLabTest);
  app.get("/api/medicine/:id", patientRequestController.medicineDropdown);
  app.get("/api/medicine", patientRequestController.medicineDropdownWithoutSpeciality);
  app.get("/api/symptoms", patientRequestController.symptomsDropdown);
  app.get("/api/disease/:id", patientRequestController.diseasesDropdown);
  app.post("/api/doctor/symptoms/:id", [authJwt.verifyDoctorToken], patientRequestController.addSymptoms);
  app.delete("/api/doctor/symptoms/:id", [authJwt.verifyDoctorToken], patientRequestController.deleteSymptoms);
  app.post("/api/doctor/disease/:id", [authJwt.verifyDoctorToken], patientRequestController.addDisease);
  app.delete("/api/doctor/disease/:id", [authJwt.verifyDoctorToken], patientRequestController.deleteDiseases);
  app.post("/api/doctor/observation/:id", [authJwt.verifyDoctorToken], patientRequestController.addObservation);
  app.post("/api/doctor/prescription/:id", [authJwt.verifyDoctorToken], patientRequestController.addPrescriptionDoc);
  app.post("/api/doctor/movetocomplete/:id", [authJwt.verifyDoctorToken], patientRequestController.moveToComplete);
  app.get("/api/doctor/changeappointmentstatus/:id", [authJwt.verifyDoctorToken], patientRequestController.cancleOrRescheduleApppointment);
  app.post("/api/doctor/moveinprocess/:id", [authJwt.verifyDoctorToken], patientRequestController.changeInToInprocessApppointmentStatus);
  app.get("/api/doctor/prescriptiondoc/:id", [authJwt.verifyDoctorToken], patientRequestController.getAllPrescriptionDoc);
  app.get("/api/doctor/viewprescription/:id", [authJwt.verifyDoctorToken], patientRequestController.viewPrescriptionDocumentDetails);
  app.get("/api/doctor/joinjitsiroom/:id", [authJwt.verifyDoctorToken], patientRequestController.joinJitsiRoom);
};
