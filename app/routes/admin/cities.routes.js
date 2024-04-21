const citiesController = require("../../controller/admin/cities/cities.controller.js");
const citiesCommonServices = require("../../controller/admin/cities/common.services.js");
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



  app.post("/api/admin/cities",[authJwt.verifyAdminToken], citiesCommonServices.addValidation, citiesController.addCities);
  app.put("/api/admin/cities/:id",[authJwt.verifyAdminToken], citiesController.updateCitiesById);
  app.delete("/api/admin/cities/:id",[authJwt.verifyAdminToken], citiesController.deleteCitiesById);
  app.get("/api/admin/cities/:id",[authJwt.verifyAdminToken], citiesController.viewCitiesById);
  app.get("/api/admin/cities",[authJwt.verifyAdminToken], citiesController.viewAllCities);
  
};
