var axios = require('axios');

function sendMessage(data) {
  var config = {
    method: 'post',
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  return axios(config)
}

function getTextMessageInput(recipient, text) {
  return JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": recipient,
    "type": "text",
    "text": {
      "preview_url": false,
      "body": text
    }
  });
}

function whatAppMsg(data) {
  const authorizationToken = data.req.headers["Authorization"]
  const options = {
    method: 'POST',
    url: `https://app-server.wati.io/api/v1/sendTemplateMessage?whatsappNumber=${data.countryCode}${data.phone_no}`,
    headers: {
      'content-type': 'text/json',
      Authorization: `Bearer ${authorizationToken}`
    },
    data: {
      broadcast_name: 'login_otp',
      template_name: 'login_otp',
      parameters: [
        { name: 'website', value: 'Oralens Health Care' },
        { name: 'otp', value: '123456' }
      ]
    }
  };

  axios
    .request(options)
    .then(function (response) {

    })
    .catch(function (error) {
      console.error(error);
    });
}


module.exports = {
  sendMessage: sendMessage,
  getTextMessageInput: getTextMessageInput,
  whatAppMsg: whatAppMsg
};
