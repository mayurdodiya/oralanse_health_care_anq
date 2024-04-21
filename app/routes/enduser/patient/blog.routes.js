const BlogController = require("../../../controller/enduser/patient/blog/blog.controller");
const BlogServices = require("../../../controller/enduser/patient/blog/service");
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

  app.get("/api/user/blog", [authJwt.verifyUserToken], BlogController.getAllBlogs);
  app.get("/api/user/blog/:slug", [authJwt.verifyUserToken], BlogController.viewBlogById);

};
