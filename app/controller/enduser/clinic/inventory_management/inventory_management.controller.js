const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: consultationServices } = require("../../../../services/consultation");
const endUserServices = require("../../services");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment');
const Op = db.Sequelize.Op;


const User = db.users;
const Patients = db.patients;
const ClinicStaffs = db.clinic_staffs;
const ClinicTreatments = db.clinic_treatments;
const Machines = db.machines;
const MachineLogs = db.machine_logs;
const Pharmacies = db.pharmacies;
const Vendors = db.vendors;
const ClinicStaffAattendances = db.clinic_staff_attendances;






// add machine
exports.addMachine = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const query = { where: { name: req.body.name, clinic_id: clinicId } };
        const isExistingData = await commonServices.get(Machines, query);
        if (isExistingData != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This machine data") });
        }

        const data = await contentServices.addMachine({ clinicId, userId, ...req.body })
        if (data != null) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Machines"), })
        } else {
            res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Machines") });
        }
    } catch (error) {

        res.status(200).json({ success: " false", message: error.message });
    }
}

// edit machine by id
exports.updateMachineById = async (req, res) => {
    try {

        const userId = req.user.id;
        const user = req.user;
        const id = req.params.id
        const isExist = await commonServices.get(Machines, { where: { id: id } })
        if (!isExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This Machines") });
        }


        const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
        let isExisting = await commonServices.get(Machines, query);
        if (isExisting) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This Machines") });
        }

        const data = await contentServices.updateMachine({ userId, ...req.body, id })
        await contentServices.addMachineLogs({ userId, name: isExist.name, machineId: id, ...isExist })
        if (data) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Machines") });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("Machines") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete machine by id
exports.deleteMachineById = async (req, res) => {
    try {
        const user = req.user;
        const userId = req.user.id;
        const id = req.params.id;

        const isExist = await commonServices.get(Machines, { where: { id: id } })
        if (!isExist) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This Machines") });
        }

        let data = await commonServices.delete(Machines, { where: { id: id } });
        if (data > 0) {
            await contentServices.addMachineLogs({ userId, name: isExist.name, machineId: id, ...isExist })
            res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Machines"), });
        } else {
            res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Machines"), });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view all machine 
exports.viewMachineById = async (req, res) => {

    try {
        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.ViewMachineById({ id, clinicId })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Machines"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// view clinic all machine 
exports.viewAllMachine = async (req, res) => {

    try {
        const { page, size, s } = req.query;
        const clinicId = req.user.clinics.id;
        const response = await contentServices.getAllMachine({ page, size, s, clinicId })

        // const expiryCount = 0;
        // const currentDate = Date.now();
        // console.log(currentDate, "------------- currentDate -------------");
        // console.log(response, "------------- sql Date -------------");
        // response.data.map(item => {
        //     if (item.expiry_date < currentDate) {
        //         console.log(item.expiry_date, "------------- item.expiry_date -------------");
        //         expiryCount = expiryCount + 1
        //     }
        // })


        // let ts = Date.now();
        // let date_ob = new Date(ts);
        // let hours = date_ob.getHours();
        // let minutes = date_ob.getMinutes();
        // let seconds = date_ob.getSeconds();
        // let day = date_ob.getDay();
        // const dateTime = hours + ":" + minutes + ":" + seconds;
        // console.log(dateTime, "------------- currentDate -------------");

        return res.status(200).json({ success: "true", message: message.GET_DATA("Machines"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// change machine status
exports.changeMachineStatus = async (req, res) => {
    try {
        const user = req.user;
        const userId = req.user.id;
        const id = req.params.id;
        const isExist = await commonServices.get(Machines, { where: { id: id } })
        if (!isExist) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This machine") })
        }

        const data = await contentServices.changeMachineStatus({ id, userId, ...req.body })

        if (data == true) {
            await contentServices.addMachineLogs({ userId, name: isExist.name, machineId: id, ...isExist })
            return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Machine status") })
        }

    } catch (error) {
        res.status(200).json({ success: 'false', message: error.message });
    }

};

// view all machine log
exports.viewAllMachineLog = async (req, res) => {

    try {
        const id = req.params.id;
        const { page, size } = req.query;
        const data = await contentServices.viewAllMachineLog({ id, page, size })
        if (data != null) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Machines uses"), data: data })
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This Machines data") })
        }


    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// add inventory items
exports.addInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;

        const query = { where: { name: req.body.name, clinic_id: clinicId } };
        const isExistingData = await commonServices.get(Machines, query);
        if (isExistingData != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This inventory data") });
        }

        const data = await contentServices.addInventory({ clinicId, userId, ...req.body })
        if (data) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Inventory") })
        } else {
            res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Inventory") });
        }

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message });
    }
}

// edit inventory by id
exports.updateInventoryById = async (req, res) => {
    try {

        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const id = req.params.id
        const user = await commonServices.get(Machines, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This inventory") });
        }

        const query = { where: [{ name: req.body.name, clinic_id: clinicId }, { id: { [Op.ne]: [id] } }] };
        let isExisting = await commonServices.get(Machines, query);
        if (isExisting) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This inventory") });
        }

        const data = await contentServices.updateInventory({ userId, clinicId, ...req.body, id })
        if (data) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Inventory"), });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("Inventory"), });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete inventory by id
exports.deleteInventoryById = async (req, res) => {
    try {

        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const user = await commonServices.get(Machines, { where: { id: id, clinic_id: clinicId } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This inventory") });
        }

        let data = await commonServices.delete(Machines, { where: { id: id } });
        if (data > 0) {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Inventory"), });
        } else {
            return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Inventory") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view inventory by id
exports.viewInventoryById = async (req, res) => {

    try {
        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.viewInventoryById({ id, clinicId })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Invontery"), data: response })
    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// view all inventory 
exports.viewAllInventory = async (req, res) => {

    try {
        const { page, size, s } = req.query;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.getAllInventory({ page, size, s, clinicId })
        // const expiryCount = 0;
        // const currentDate = Date.now();
        // console.log(currentDate, "------------- currentDate -------------");
        // response.data.map(item => {
        //     if (item.expiry_date < currentDate) {
        //         console.log(item.expiry_date, "------------- item.expiry_date -------------");
        //         expiryCount = expiryCount + 1
        //     }
        // })
        // console.log(expiryCount, "------------- expiryCount -------------");
        // const criticalItems = await commonServices.getAll(Machines, { where: { clinic_id: clinicId, status: options.machineStatus.BROKEN } })
        // const deadStock = await commonServices.getAll(Machines, { where: { clinic_id: clinicId, quantity: 0 } })

        return res.status(200).json({
            success: "true",
            message: message.GET_DATA("Invontery"),
            data: {
                totalItems: response.totalItems,
                // criticalItems: criticalItems.length,
                // expiredItems: criticalItems.length,
                // restockRequest: deadStock.length,
                data: response.data,
                totalPages: response.totalPages,
                currentPage: response.currentPage,
            }
            // data: response
        })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// Change inventory stock
exports.changeInventoryStock = async (req, res) => {

    try {
        const id = req.params.id;
        const clinicId = req.user.clinics.id;
        const status = req.query.status;
        const user = await commonServices.get(Pharmacies, { where: { id: id, clinic_id: clinicId } })
        const oldStock = user.quantity;

        if (status == "increse") {
            const finalStock = oldStock + req.body.quantity;
            var data = await commonServices.update(Pharmacies, { where: { id: id } }, { quantity: finalStock })
            if (data) {
                return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Inventory stock") });
            }
        }
        if (status == "decrese") {
            var finalStock = oldStock - req.body.quantity;
            const data = await commonServices.update(Pharmacies, { where: { id: id } }, { quantity: finalStock })
            if (data) {
                return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Inventory stock") });
            }
        }

    } catch (error) {

        res.status(200).json({ success: "false", message: error.message });
    }
};

// add vendor
exports.addVendor = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const query = { where: { phone_no: req.body.phone_no, clinic_id: clinicId } };

        const isExistingData = await commonServices.get(Vendors, query);
        if (isExistingData != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This vendor data") });
        }

        const data = await contentServices.addVendor({ clinicId, userId, ...req.body })
        if (data != null) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Vendor"), })
        } else {
            res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Vendor") });
        }
    } catch (error) {

        res.status(200).json({ success: " false", message: error.message });
    }
}

// edit vendor by id
exports.updateVendorById = async (req, res) => {
    try {

        const userId = req.user.id;
        const id = req.params.id
        const user = await commonServices.get(Vendors, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This vendor") });
        }

        const data = await contentServices.updateVendor({ userId, ...req.body, id })
        if (data) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Vendor"), });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("Vendor"), });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete vendor by id
exports.deleteVendorById = async (req, res) => {
    try {

        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const user = await commonServices.get(Vendors, { where: { id: id, clinic_id: clinicId } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This vendor") });
        }

        let data = await commonServices.delete(Vendors, { where: { id: id } });
        if (data > 0) {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Vendor"), });
        } else {
            return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Vendor") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view vendor by id
exports.viewVendorByid = async (req, res) => {

    try {
        const id = req.params.id;

        const response = await contentServices.getVendorById({ id })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Vendor"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// view all vendor 
exports.viewAllVendor = async (req, res) => {

    try {
        const { page, size, s } = req.query;
        const clinicId = req.user.clinics.id;

        const response = await contentServices.getAllVendor({ page, size, s, clinicId })
        return res.status(200).json({ success: "true", message: message.GET_DATA("Vendors"), data: response })

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }

};

// vendor dropdown
exports.vendorDropdown = async (req, res) => {

    try {
        let query = {
            where: [],
            attributes: ['id', 'full_name', 'phone_no', 'address'],
        };

        let response = await commonServices.getAndCountAll(Vendors, query)
        return res.status(200).json({ success: "true", message: message.GET_DATA("Vendors"), data: response })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};