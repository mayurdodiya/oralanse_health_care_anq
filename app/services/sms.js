const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

module.exports = {
  sendSMS: () => {
    // client.messages.create({
    //   body: 'This is your Verification code for MatchUpMates registration ' + randomcode,
    //   from: '+19195825831',
    //   to: `+${phonecode}${value}`
    // })
    //   .then(message =>
    //     console.log(message.sid)
    //   ).catch(err => console.log(err))
  }
}
