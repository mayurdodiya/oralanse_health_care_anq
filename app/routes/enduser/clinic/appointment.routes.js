const appointmentController = require("../../../controller/enduser/clinic/appointment/appointment.controller.js");
const doctorPatientRequestController = require("../../../controller/enduser/doctor/patient_request/patient_request.controller.js");
const appointmentServices = require("../../../controller/enduser/clinic/appointment/service.js");
const authJwt = require("../../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/appointment", [authJwt.verifyHospitalToken], appointmentController.appointmentListing);
  app.get("/api/clinic/appointmentdetail/:id", [authJwt.verifyHospitalToken], appointmentController.viewConsultationRequestById);
  app.post("/api/clinic/appointment/status/:id", [authJwt.verifyHospitalToken], appointmentController.appointmentConfirmation);
  app.post("/api/clinic/appointment/hrbilling/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addHrBilling);
  app.delete("/api/clinic/appointment/hrbilling/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.deleteHrBilling);
  app.post("/api/clinic/appointment/paymenthistory/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addPaymentHistory);
  app.delete("/api/clinic/appointment/paymenthistory/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.deletePaymentHistory);
  app.post("/api/clinic/suggestedtreatment/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addSuggestedTreatment);
  app.delete("/api/clinic/suggestedtreatment/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.deleteTreatment);
  app.post("/api/clinic/suggestedmedicine/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addSuggestedMedicine);
  app.delete("/api/clinic/suggestedmedicine/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.deleteSuggestedMedicine);
  app.post("/api/clinic/symptoms/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addSymptoms);
  app.delete("/api/clinic/symptoms/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.deleteSymptoms);
  app.post("/api/clinic/disease/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addDisease);
  app.delete("/api/clinic/disease/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.deleteDiseases);
  app.post("/api/clinic/observation/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addObservation);
  app.post("/api/clinic/movetocomplete/:id", [authJwt.verifyHospitalToken], appointmentController.moveToComplete);
  app.post("/api/clinic/moveinprocess/:id", [authJwt.verifyHospitalToken], appointmentController.changeInToInprocessApppointmentStatus);
  app.get("/api/clinic/bedlisting/:id", [authJwt.verifyHospitalToken], appointmentController.bedListing);
  app.get("/api/clinic/roomlisting", [authJwt.verifyHospitalToken], appointmentController.roomNoListing);
  app.get("/api/doctorspeciality/:id", appointmentController.doctorSpecialityListing);
  app.get("/api/clinic/changeappointmentstatus/:id", [authJwt.verifyHospitalToken], appointmentController.cancleOrRescheduleApppointment);
  app.post("/api/clinic/newlabreport/:id", [authJwt.verifyHospitalToken], doctorPatientRequestController.addNewLabReport);
  app.get("/api/patientinsurances/:id", appointmentController.getPatientInsurance);

  app.post("/api/clinic/assignnurse/:id", [authJwt.verifyHospitalToken], appointmentController.assignPatientNurse);
  app.get("/api/clinic/assignnurse/:id", [authJwt.verifyHospitalToken], appointmentController.getPatientAssignAllNurse);
};
