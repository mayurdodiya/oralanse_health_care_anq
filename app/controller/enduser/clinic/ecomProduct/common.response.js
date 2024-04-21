const { response } = require("express")
const moment = require("moment")
const options = require("../../../../config/options");


module.exports = {
    viewAllJobsResponse: (data) => {

        const objs = data.map(item => {
            return {
                id: item.id,
                company_name: item.company_name,
                image_path: item.image_path,
                name: item.name,
                description: item.description,
                experience: item.experience,
                location: item.location,
                salary: item.salary,
                job_type: item.job_type,
                createdAt: item.createdAt
            }
        })
        return objs
    },

    modifyOrderRes: (responseData) => {
        const objs = responseData.data.map(item => {
            return {
                name: item.order_details.ecom_products.name,
                price: item.order_details.ecom_products.price,
                status: item.order_details.status,
                createdAt: item.createdAt,
                medias: item.order_details.ecom_products.medias,
            }
        })
        return objs
    },


}