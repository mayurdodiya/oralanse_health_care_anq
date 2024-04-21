const ticketController = require("../../../controller/enduser/patient/raisedTicket/raised_ticket.controller");
const ticketServices = require("../../../controller/enduser/patient/raisedTicket/service");
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

  app.post("/api/user/ticket", [authJwt.verifyUserToken], ticketController.raisedNewTicket);
  app.get("/api/user/ticket", [authJwt.verifyUserToken], ticketController.viewAllTicket);
  app.get("/api/user/ticket/:id", [authJwt.verifyUserToken], ticketController.viewTicketById);
  app.get("/api/user/tickethistory/:id", [authJwt.verifyUserToken], ticketController.viewTicketHistoryById);
  app.post("/api/user/ticket/:id", [authJwt.verifyUserToken], ticketController.addNewMessage);

};
