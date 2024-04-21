const hrManagementController = require("../../../controller/enduser/doctor/hr_management/hr_management.controller.js");
const hrManagementServices = require("../../../controller/enduser/doctor/hr_management/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // all apis are pending
  // app.post("/api/doctor/hrmanagement/employee", [authJwt.verifyDoctorToken], hrManagementServices.addValidation, hrManagementController.addEmployee);
  // app.put("/api/doctor/hrmanagement/employee/:slug", [authJwt.verifyDoctorToken], hrManagementController.editEmployeeProfile);
  // app.delete("/api/doctor/hrmanagement/employee/:slug", [authJwt.verifyDoctorToken], hrManagementController.deleteEmployeeProfile);
  // app.get("/api/doctor/hrmanagement/employee", [authJwt.verifyDoctorToken], hrManagementController.viewAllEmployee);
  // app.get("/api/doctor/hrmanagement/employeeattendence", [authJwt.verifyDoctorToken], hrManagementController.viewAllEmployeeAttendence);
  // app.get("/api/doctor/hrmanagement/employeepayout", [authJwt.verifyDoctorToken], hrManagementController.viewAllEmployeePayout);
  // app.get("/api/doctor/hrmanagement/doctor", [authJwt.verifyDoctorToken], hrManagementController.viewAllDoctor);
  // app.post("/api/doctor/hrmanagement/doctor", [authJwt.verifyDoctorToken], hrManagementServices.addDoctorValidation, hrManagementController.addDoctor);
  // app.put("/api/doctor/hrmanagement/doctor/:slug", [authJwt.verifyDoctorToken], hrManagementController.updateDoctorProfile);
  // app.delete("/api/doctor/hrmanagement/doctor/:slug", [authJwt.verifyDoctorToken], hrManagementController.deleteDoctorProfile);
  // app.get("/api/doctor/hrmanagement/doctor/:slug", [authJwt.verifyDoctorToken], hrManagementController.viewDoctorById);
  // app.get("/api/doctor/hrmanagement/assessmentsquiz", [authJwt.verifyDoctorToken], hrManagementController.viewAllHealtAssessmentQuiz);
  // app.post("/api/doctor/hrmanagement/assessmentsquiz", [authJwt.verifyDoctorToken], hrManagementController.addHealtAssessmentQuizAnswer);
};