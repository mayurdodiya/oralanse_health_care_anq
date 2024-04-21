const blogsController = require("../../controller/admin/blogs/blogs.controller.js");
const blogsCommonServices = require("../../controller/admin/blogs/common.services.js");
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


  app.post("/api/admin/blogs",[authJwt.verifyAdminToken], blogsCommonServices.addValidation, blogsController.addBlogs);
  app.put("/api/admin/blogs/:id",[authJwt.verifyAdminToken], blogsController.updateBlogsById);
  app.delete("/api/admin/blogs/:id",[authJwt.verifyAdminToken], blogsController.deleteBlogsById);
  app.get("/api/admin/blogs/:id",[authJwt.verifyAdminToken], blogsController.viewBlogsById);
  app.get("/api/admin/blogs",[authJwt.verifyAdminToken], blogsController.viewAllBlogs);
  
};
