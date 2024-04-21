const inventoryManagementController = require("../../../controller/enduser/clinic/inventory_management/inventory_management.controller.js");
const inventoryManagementServices = require("../../../controller/enduser/clinic/inventory_management/service.js");
const multer = require('multer');
const authJwt = require("../../../middleware/authjwt.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/clinic/inventory/machine", [authJwt.verifyHospitalToken], inventoryManagementServices.addValidation, inventoryManagementController.addMachine);
  app.put("/api/clinic/inventory/machine/:id", [authJwt.verifyHospitalToken], inventoryManagementController.updateMachineById);
  app.delete("/api/clinic/inventory/machine/:id", [authJwt.verifyHospitalToken], inventoryManagementController.deleteMachineById);
  app.get("/api/clinic/inventory/machine", [authJwt.verifyHospitalToken], inventoryManagementController.viewAllMachine);
  app.post("/api/clinic/inventory/machinestatus/:id", [authJwt.verifyHospitalToken], inventoryManagementController.changeMachineStatus);
  app.get("/api/clinic/inventory/machinelog/:id", [authJwt.verifyHospitalToken], inventoryManagementController.viewAllMachineLog);
  app.get("/api/clinic/inventory/machine/:id", [authJwt.verifyHospitalToken], inventoryManagementController.viewMachineById);

  app.post("/api/clinic/inventory", [authJwt.verifyHospitalToken], inventoryManagementServices.addInventoryValidation, inventoryManagementController.addInventory);
  app.get("/api/clinic/inventory/:id", [authJwt.verifyHospitalToken], inventoryManagementController.viewInventoryById);
  app.get("/api/clinic/inventory", [authJwt.verifyHospitalToken], inventoryManagementController.viewAllInventory);
  app.put("/api/clinic/inventory/:id", [authJwt.verifyHospitalToken], inventoryManagementController.updateInventoryById);
  app.put("/api/clinic/inventory/stock/:id", [authJwt.verifyHospitalToken], inventoryManagementController.changeInventoryStock);
  app.delete("/api/clinic/inventory/:id", [authJwt.verifyHospitalToken], inventoryManagementController.deleteInventoryById);

  app.get("/api/vendor", inventoryManagementController.vendorDropdown);
  app.post("/api/clinic/vendor", [authJwt.verifyHospitalToken], inventoryManagementServices.addVendorValidation, inventoryManagementController.addVendor);
  app.put("/api/clinic/vendor/:id", [authJwt.verifyHospitalToken], inventoryManagementController.updateVendorById);
  app.delete("/api/clinic/vendor/:id", [authJwt.verifyHospitalToken], inventoryManagementController.deleteVendorById);
  app.get("/api/clinic/vendor", [authJwt.verifyHospitalToken], inventoryManagementController.viewAllVendor);
  app.get("/api/clinic/vendor/:id", [authJwt.verifyHospitalToken], inventoryManagementController.viewVendorByid);
};