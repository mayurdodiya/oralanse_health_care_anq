const db = require("../../../../models");
const Sequelize = require("sequelize");
const { methods: commonServices, pincodeExist } = require("../../../../services/common");
const { methods: contentServices } = require("../../../../services/content")
const { methods: ecommerceService } = require("../../../../services/ecommerce");
const { methods: consultationServices } = require("../../../../services/consultation");
const sendAllNotification = require("../../../../services/settings");
const fcmNotificationPayload = require("../../../../services/fcm_notification_payload")
const endUserServices = require("../../services");
const message = require("../../message");
const options = require('../../../../config/options');
const moment = require('moment');
const { format } = require("path");
const Op = db.Sequelize.Op;


const User = db.users;
const Appointments = db.appointments;
const Patients = db.patients;
const ClinicStaffs = db.clinic_staffs;
const ClinicTreatments = db.clinic_treatments;
const Clinics = db.clinics;
const Machines = db.machines;
const Pharmacies = db.pharmacies;
const Medicines = db.medicines;
const Beds = db.beds;
const Vendors = db.vendors;
const ClinicStaffAattendances = db.clinic_staff_attendances;
const PharmacyOrders = db.pharmacy_orders;
const PharmacyOrderDetails = db.pharmacy_order_details;



// add pharmacy
exports.addPharmacy = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const query = { where: { medicine_id: req.body.medicine_id, clinic_id: clinicId, manufacturer: req.body.manufacturer } };
        const isExistingData = await commonServices.get(Pharmacies, query);
        if (isExistingData != null) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This pharmacy data") });
        }

        const data = await contentServices.addPharmacy({ clinicId, userId, ...req.body })
        if (data) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Pharmacy") })
        } else {
            res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Pharmacy") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// edit pharmacy by id
exports.updatePharmacyById = async (req, res) => {
    try {

        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const id = req.params.id
        const user = await commonServices.get(Pharmacies, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This pharmacy") });
        }

        const query = { where: [{ medicine_id: req.body.medicine_id, clinic_id: clinicId, manufacturer: req.body.manufacturer }, { id: { [Op.ne]: [id] } }] };
        let isExisting = await commonServices.get(Pharmacies, query);
        if (isExisting) {
            return res.status(200).json({ success: "false", message: message.DATA_EXIST("This pharmacy") });
        }

        const data = await contentServices.updatePharmacy({ userId, clinicId, ...req.body, id })
        if (data) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Pharmacy"), });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("Pharmacy"), });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete pharmacy by id
exports.deletePharmacyById = async (req, res) => {
    try {

        const id = req.params.id;
        const clinicId = req.user.clinics.id;

        const user = await commonServices.get(Pharmacies, { where: { id: id, clinic_id: clinicId } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This pharmacy") });
        }

        let data = await commonServices.delete(Pharmacies, { where: { id: id } });
        if (data > 0) {
            return res.status(200).json({ success: "true", message: message.DELETE_PROFILE("Pharmacy"), });
        } else {
            return res.status(200).json({ success: "false", message: message.DELETE_PROFILE_FAILED("Pharmacy") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view pharmacy by id
exports.viewPharmacyById = async (req, res) => {
    try {

        const id = req.params.id;
        const clinicId = req.user.clinics.id;
        console.log(clinicId);
        const query = {
            where: { id: id, clinic_id: clinicId },
            attributes: ['id', 'expiry_date', 'amount', 'quantity', 'description', 'benefits_risk', 'medicine_id', 'manufacturer', 'uses'],
            include: [
                { model: Medicines, as: 'pharmacy_medicines', attributes: ['id', 'name', 'dosage'] }
            ]

        };

        let data = await commonServices.get(Pharmacies, query);
        if (data) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Pharmacy"), data: data });
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Pharmacy") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view all pharmacy 
exports.viewAllPharmacy = async (req, res) => {

    try {
        const { page, size, s } = req.query;
        const clinicId = req.user.clinics.id;
        console.log(clinicId);

        const response = await contentServices.getAllPharmacy({ page, size, s, clinicId })
        const stock = await commonServices.getAll(Pharmacies, { where: [{ clinic_id: clinicId }, { quantity: 0 }] })

        const currentDate = moment(Date.now()).format("YYYY MM DD");
        var expiredProduct = 0;

        response.data.map(item => {
            const expiryDate = moment(item.expiry_date).format("YYYY MM DD");
            if (expiryDate.toString() < currentDate.toString()) {
                expiredProduct = expiredProduct + 1;
            }
        })

        return res.status(200).json({
            success: "true",
            message: message.GET_DATA("Pharmacy"),
            data: {
                totalItems: response.totalItems,
                expiredProduct: expiredProduct,
                outOfStock: stock.length,
                data: response.data,
                totalPages: response.totalPages,
                currentPage: response.currentPage,
            }
        })

    } catch (error) {
        res.status(200).json({ success: " false", message: error.message })
    }

};

// change pharmacy stock
exports.changepharmacyStock = async (req, res) => {

    try {
        const id = req.params.id;
        const clinicId = req.user.clinics.id;
        const status = req.query.status;
        const user = await commonServices.get(Pharmacies, { where: { id: id, clinic_id: clinicId, type: options.pharmacyType.PHARMACY } })
        const oldStock = user.quantity;

        if (status == "increse") {
            const finalStock = oldStock + req.body.quantity;
            var data = await commonServices.update(Pharmacies, { where: { id: id } }, { quantity: finalStock })
            if (data) {
                return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Pharmacy stock") });
            }
        }
        if (status == "decrese") {
            var finalStock = oldStock - req.body.quantity;
            const data = await commonServices.update(Pharmacies, { where: { id: id } }, { quantity: finalStock })
            if (data) {
                return res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Pharmacy stock") });
            }
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
};

// pharmacy order listing
exports.orderListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const clinicId = req.user.clinics.id;
        const { page, size, status } = req.query;
        const { limit, offset } = commonServices.getPagination(page, size)
        const query = {
            where: [{ clinic_id: clinicId }], attributes: ['id', 'appointment_id'],
            include: [
                {
                    model: PharmacyOrderDetails, as: "pharmacy_order_details", where: [{ status: status }], attributes: ['quantity', 'price', 'status'],
                    include: [
                        {
                            model: Pharmacies, as: "pharmacyData", attributes: ['id', 'medicine_id'],
                            include: [
                                { model: Medicines, as: "pharmacy_medicines", attributes: ['id', 'name', 'dosage'], }

                            ]
                        }
                    ]
                },
                { model: Beds, as: "bedData", attributes: ['room_number', 'bed_number'], },
                { model: User, as: "pharmacyPatient", required: false, attributes: ['full_name', 'phone_no', 'profile_image'], },
                { model: Appointments, as: "pharmacyAppointments", required: false, attributes: ['type'], },
            ]
        }
        const data = await commonServices.getAndCountAll(PharmacyOrders, query)
        const responseData = commonServices.getPagingData(data, page, limit, offset);
        return res.status(200).json({ success: "true", message: message.GET_DATA("Pharmacy order"), data: responseData });
    } catch (error) {
        return res.status(200).json({ success: "false", message: error.message })
    }
};

// accept, decline & complete pharmacy order
exports.acceptAndDeclineOrder = async (req, res) => {
    try {

        const status = req.body.status;
        const userId = req.user.id;
        const pharmacyOrderId = req.params.id; // put pharmacy order id in params (pharmacy_order table id)
        const pharmacyOrderData = await commonServices.get(PharmacyOrders, { where: [{ id: pharmacyOrderId }] })
        if (!pharmacyOrderData) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This pharmacy order") });
        }

        const pharmacyOrderDetail = await commonServices.get(PharmacyOrderDetails, { where: { pharmacy_order_id: pharmacyOrderId } })
        const pharmacyOrderDetailId = pharmacyOrderDetail.id;
        const orderQuantity = pharmacyOrderDetail.quantity;
        const pharmacyId = pharmacyOrderDetail.pharmacy_id;
        const pharmacyData = await commonServices.get(Pharmacies, { where: { id: pharmacyId } });
        const oldStock = pharmacyData.quantity;
        const medicineId = pharmacyData.medicine_id;
        const patientUserId = pharmacyData.user_id;

        if (status == "accept") {
            const t = await db.sequelize.transaction();
            try {
                const obj = {
                    status: options.pharmacyOrderStatus.READYTOSHIP
                }
                const orderStatus = commonServices.update(PharmacyOrderDetails, { where: { id: pharmacyOrderDetailId } }, obj, { transaction: t })
                if (!orderStatus) {
                    await t.rollback()
                }

                if (orderQuantity > oldStock) {
                    return res.status(200).json({ success: "false", message: message.NO_QUANTTY("This") });
                }
                const newStock = oldStock - orderQuantity;
                const changeStock = await commonServices.update(Pharmacies, { where: [{ id: pharmacyId }] }, { quantity: newStock }, { transaction: t })
                if (!changeStock) {
                    await t.rollback()
                }

                await t.commit()

                // now hr billing ma entry pdse 
                const appointmentId = pharmacyOrderData.appointment_id;
                const appointmentData = await commonServices.get(Appointments, { where: [{ id: appointmentId }] });
                const patientId = appointmentData.patient_id;
                const medicineData = await commonServices.get(Medicines, { where: [{ id: medicineId }] });
                const medicineName = medicineData.name;
                const orderdPrice = pharmacyOrderData.net_total;
                await consultationServices.addHrBilling(res, { patientId, appointmentId, userId, particulars: `Patient Medicine ${medicineName}`, amount: orderdPrice })

                // jyre pharmacy mathi req accept thay to notification patient ne jse
                // for push notification
                const payload = fcmNotificationPayload.pharmacyOrderAcceptDeclineComplete({ userId: patientUserId, body: 'accepted' })
                await sendAllNotification.sendAllNotification({ payload })
                return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Pharmacy order status") });
            } catch (error) {
                await t.rollback();
            }

        }

        if (status == "decline") {
            const t = await db.sequelize.transaction();
            try {

                const obj = {
                    status: options.pharmacyOrderStatus.DECLINE
                }
                const orderStatus = await commonServices.update(PharmacyOrderDetails, { where: { id: pharmacyOrderDetailId } }, obj, { transaction: t });
                if (!orderStatus) {
                    await t.rollback()
                }

                await t.commit();

                // for push notification
                const payload = fcmNotificationPayload.pharmacyOrderAcceptDeclineComplete({ userId: patientUserId, body: 'declined' })
                await sendAllNotification.sendAllNotification({ payload })

                return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Pharmacy order status") });

            } catch (error) {
                await t.rollback();
            }
        }

        if (status == options.pharmacyOrderStatus.COMPLETE) {
            const obj = {
                status: options.pharmacyOrderStatus.DELIVERED
            }
            const data = commonServices.update(PharmacyOrderDetails, { where: { id: pharmacyOrderDetailId } }, obj)

            // for push notification
            const payload = fcmNotificationPayload.pharmacyOrderAcceptDeclineComplete({ userId: patientUserId, body: 'delivered' });
            await sendAllNotification.sendAllNotification({ payload });

            return res.status(200).json({ success: "true", message: message.CHANGE_DATA("Pharmacy order status") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }
};