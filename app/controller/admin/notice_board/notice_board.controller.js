const db = require("../../../models");
const commonResponse = require('./common.response');
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require('../../../services/content');
const moment = require("moment");
const Op = db.Sequelize.Op;



const NoticeBoards = db.notice_boards;




// add notice
exports.addNotice = async (req, res) => {
    try {

        const adminId = req.user.id;
        const data = await contentServices.addNotice({ adminId, ...req.body })
        if (data) {
            res.status(200).json({ success: "true", message: message.ADD_DATA("Notice") })
        } else {
            res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Notice") });
        }

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// edit notice by id
exports.updateNoticeById = async (req, res) => {
    try {

        const adminId = req.user.id;
        const id = req.params.id

        const data = await contentServices.updateNotice({ adminId, ...req.body, id })
        if (data) {
            res.status(200).json({ success: "true", message: message.UPDATE_PROFILE("Notice"), });
        } else {
            res.status(200).json({ success: "false", message: message.NOT_UPDATE("Notice"), });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// delete notice by id
exports.deleteNoticeById = async (req, res) => {
    try {

        const id = req.params.id;

        const user = await commonServices.get(NoticeBoards, { where: { id: id } })
        if (!user) {
            return res.status(200).json({ success: "false", message: message.NO_DATA("This notice") });
        }

        let data = await commonServices.delete(NoticeBoards, { where: { id: id } });
        if (data > 0) {
            return res.status(200).json({ success: "true", message: message.DELETED_SUCCESS("Notice data"), });
        } else {
            return res.status(200).json({ success: "false", message: message.NOT_DELETED("Notice data") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view notice by id
exports.viewNoticeById = async (req, res) => {
    try {

        const id = req.params.id;
        const data = await contentServices.viewNoticeById({ id })
        if (data) {
            return res.status(200).json({ success: "true", message: message.GET_DATA("Notice"), data: data });
        } else {
            return res.status(200).json({ success: "false", message: message.NO_DATA("Notice") });
        }
    } catch (error) {
        res.status(200).json({ success: "false", message: error.message });
    }
}

// view all notice
exports.viewAllNotice = async (req, res) => {

    try {
        const { page, size } = req.query;

        const response = await contentServices.getAllNotice({ page, size })
        return res.status(200).json({
            success: "true",
            message: message.GET_DATA("Notices"),
            data: {
                totalItems: response.totalItems,
                data: response.data,
                totalPages: response.totalPages,
                currentPage: response.currentPage,
            }
        })

    } catch (error) {
        res.status(200).json({ success: "false", message: error.message })
    }

};