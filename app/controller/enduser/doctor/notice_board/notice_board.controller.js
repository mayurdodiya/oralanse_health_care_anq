const db = require("../../../../models");
const commonResponse = require('./common.response');
const message = require("../../message");
const { methods: commonServices, pincodeExist } = require('../../../../services/common');
const { methods: contentServices } = require('../../../../services/content');
const options = require("../../../../config/options");
const Op = db.Sequelize.Op;




// view all notice
exports.viewAllNotice = async (req, res) => {

    try {
        const { page, size } = req.query;
        const type = options.noticeType.DOCTOR

        const response = await contentServices.getAllNotice({ type, page, size })
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
        res.status(200).json({ success: " false", message: error.message })
    }

};

