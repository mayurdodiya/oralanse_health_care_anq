const profileController = require("../../../controller/enduser/clinic/raised_ticket/raised_ticket.controller.js");
const profileServices = require("../../../controller/enduser/clinic/raised_ticket/service.js");
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

  app.post("/api/clinic/raisedticket", [authJwt.verifyHospitalToken], profileServices.addTicketValidation, profileController.addRaisedTicket);
  app.put("/api/clinic/raisedticket/:id", [authJwt.verifyHospitalToken],  profileController.updateRaisedTicket);
  app.delete("/api/clinic/raisedticket/:id", [authJwt.verifyHospitalToken],  profileController.deleteRaisedTicket);
  app.get("/api/clinic/raisedticket", [authJwt.verifyHospitalToken],  profileController.viewAllRaisedTicket);
  app.get("/api/clinic/raisedticket/:id", [authJwt.verifyHospitalToken],  profileController.viewRaisedTicketById);
};
