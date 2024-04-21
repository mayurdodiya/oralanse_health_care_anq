const ticketController = require("../../controller/admin/raisedTicket/raised_ticket.controller");
const ticketServices = require("../../controller/admin/raisedTicket/service");
const multer = require('multer');
const authJwt = require("../../middleware/authjwt.js");
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  app.get("/api/admin/ticket", [authJwt.verifyAdminToken], ticketController.viewAllTicket);
  app.post("/api/admin/ticketmessage/:id", [authJwt.verifyAdminToken], ticketController.addNewMessage);
  app.get("/api/admin/ticket/:id", [authJwt.verifyAdminToken], ticketController.viewTicketById);
  app.get("/api/admin/tickethistory/:id", [authJwt.verifyAdminToken], ticketController.viewTicketHistoryById);
  app.get("/api/admin/ticketstatus/:id", [authJwt.verifyAdminToken], ticketController.closeTicket);

};
