const blogsController = require("../../../controller/enduser/clinic/blogs/blogs.controller.js");
const blogsCommonServices = require("../../../controller/enduser/clinic/blogs/common.services.js");
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


;
  app.get("/api/clinic/blogs/:id",[authJwt.verifyHospitalToken], blogsController.viewBlogsById);
  app.get("/api/clinic/blogs",[authJwt.verifyHospitalToken], blogsController.viewAllBlogs);
  
};
