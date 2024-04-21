const StaticPageController = require("../../controller/enduser/staticPages/staticpage.controller");
const StaticPageServices = require("../../controller/enduser/staticPages/service");
const multer = require('multer');
const authJwt = require("../../middleware/authjwt");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/staticpage/:slug", [authJwt.verifyUserToken], StaticPageController.getStaticPageDataById);

};
