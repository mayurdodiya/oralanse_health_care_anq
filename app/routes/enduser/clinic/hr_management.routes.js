const hrManagementController = require("../../../controller/enduser/clinic/hr_management/hr_management.controller.js");
const hrManagementServices = require("../../../controller/enduser/clinic/hr_management/service.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/clinic/nurse", [authJwt.verifyHospitalToken], hrManagementController.viewClinicAllNurse);

  app.post("/api/clinic/hrmanagement/employee", [authJwt.verifyHospitalToken], hrManagementServices.addValidation, hrManagementController.addEmployee);
  app.put("/api/clinic/hrmanagement/employee/:slug", [authJwt.verifyHospitalToken], hrManagementController.editEmployeeProfile);
  app.delete("/api/clinic/hrmanagement/employee/:slug", [authJwt.verifyHospitalToken], hrManagementController.deleteEmployeeProfile);
  app.get("/api/clinic/hrmanagement/employee/:slug", [authJwt.verifyHospitalToken], hrManagementController.viewEmployeeById);
  app.get("/api/clinic/hrmanagement/employee", [authJwt.verifyHospitalToken], hrManagementController.viewAllEmployee);
  app.get("/api/clinic/hrmanagement/employeeattendence", [authJwt.verifyHospitalToken], hrManagementController.viewAllEmployeeAttendence);
  app.get("/api/clinic/hrmanagement/employeeallattendence/:id", [authJwt.verifyHospitalToken], hrManagementController.viewEmployeeAllAttendence);
  app.get("/api/clinic/hrmanagement/employeepayout", [authJwt.verifyHospitalToken], hrManagementController.viewAllEmployeePayout);
  app.get("/api/clinic/hrmanagement/changepayoutstatus/:id", [authJwt.verifyHospitalToken], hrManagementController.changePayoutStatus);

  app.get("/api/clinic/hrmanagement/doctor", [authJwt.verifyHospitalToken], hrManagementController.viewAllDoctor);
  app.post("/api/clinic/hrmanagement/doctor", [authJwt.verifyHospitalToken], hrManagementServices.addDoctorValidation, hrManagementController.addDoctor);
  app.put("/api/clinic/hrmanagement/doctor/:slug", [authJwt.verifyHospitalToken], hrManagementController.updateDoctorProfile);
  app.delete("/api/clinic/hrmanagement/doctor/:slug", [authJwt.verifyHospitalToken], hrManagementController.deleteDoctorProfile);
  app.get("/api/clinic/hrmanagement/doctor/:slug", [authJwt.verifyHospitalToken], hrManagementController.viewDoctorById);

  app.get("/api/clinic/hrmanagement/assessmentsquiz", [authJwt.verifyHospitalToken], hrManagementController.viewAllHealtAssessmentQuiz);
  app.post("/api/clinic/hrmanagement/assessmentsquiz", [authJwt.verifyHospitalToken], hrManagementController.addHealthAssessmentQuizAnswer);
  app.get("/api/clinic/hrmanagement/assessmentreportdetail/:slug", [authJwt.verifyHospitalToken], hrManagementController.viewEmployeeAssementHistoryDetail);
  app.get("/api/clinic/hrmanagement/assessmentreport/:slug", [authJwt.verifyHospitalToken], hrManagementController.viewAllEmployeeAssementHistory);
  app.post("/api/clinic/hrmanagement/stafftiming/:id", [authJwt.verifyHospitalToken], hrManagementController.scheduleStaffTimings)
  app.put("/api/clinic/hrmanagement/stafftiming/:id", [authJwt.verifyHospitalToken], hrManagementController.editScheduleStaffTimings)
  app.get("/api/clinic/hrmanagement/stafftiming/:id", [authJwt.verifyHospitalToken], hrManagementController.viewScheduleStaffTimings)
  app.post("/api/clinic/doctorsearch", [authJwt.verifyHospitalToken], hrManagementController.getDoctorPhoneSearchAndAdd)
  app.get("/api/clinic/addsearchdoctor/:id", [authJwt.verifyHospitalToken], hrManagementController.addExistDoctorInClinic)
};