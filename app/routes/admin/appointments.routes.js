const appointmentsController = require("../../controller/admin/appointments/appointments.controller.js");
const patientRequestController = require("../../controller/enduser/doctor/patient_request/patient_request.controller.js");
// const appointmentsCommonServices = require("../../controller/admin/appointments/common.services.js");
const authJwt = require("../../middleware/authjwt.js");
const multer = require('multer');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.get("/api/admin/appointments", [authJwt.verifyAdminToken], appointmentsController.viewAppoitmentDetail);
  app.get("/api/admin/requestdetails/:id", [authJwt.verifyAdminToken], patientRequestController.viewConsultationRequestById);
  app.get("/api/admin/prescriptiondoc/:id", [authJwt.verifyAdminToken], patientRequestController.viewPrescriptionDocById);
  app.get("/api/admin/upcomingappointments", [authJwt.verifyAdminToken], appointmentsController.viewUpcomingAppoitment);
  app.get("/api/admin/pastappointments/:slug", [authJwt.verifyAdminToken], appointmentsController.viewPastAppoitmentById);
  app.get("/api/admin/cancleappointments/:slug", [authJwt.verifyAdminToken], appointmentsController.cancleAppoitmentById);
  app.get("/api/admin/rescheduleappointments/:slug", [authJwt.verifyAdminToken], appointmentsController.rescheduleAppoitmentById);
};
