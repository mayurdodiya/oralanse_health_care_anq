const moment = require("moment")
const options = require("../../../../config/options")

module.exports = {
  modifyMyChallenge: (response) => {
    const obj = response.map(item => {
      return {
        id: item.id,
        user_id: item.user_id,
        status: item.status,
        credit_points: item.credit_points,
        start_date: moment(item.createdAt).format(options.DateFormat.DATE),
        elapsed_time: item.time,
        total_time: item.challenge.time,
        challenge_id: item.challenge_id,
        challenge_name: item.challenge.name,
        challenge_description: item.challenge.description,
        challenge_image: item.challenge.image_path,
        challenge_slug: item.challenge.slug,
      }
    })
    return obj
  },
}