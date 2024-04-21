const db = require('../models');
const DeviceToken = db.device_tokens;
const { methods: commonServices } = require("./common")
module.exports = {
  subscribeTopic: (deviceToken) => {
    var topic = "oralens-health-care";
    firebaseAdmin.messaging().subscribeToTopic(deviceToken, topic)
      .then(function (response) {
        return console.log("Successfully subscribed to topic:", response.errors);
      })
  },

  sendMessageToSubscribeTopic: (payload) => {

    const message = {
      notification: {
        title: `${payload.title}`,
        body: `${payload.body}`,
      },

      data: {

        redirect_action: payload.redirect_action,
        // id: catelog_data.id ? catelog_data.id.toString() : '1',
        // name: catalog_name,
        image: "http://localhost:8020/uploads/image/profile/random2.jpg",
        // imageUrl: "http://localhost:8020/uploads/image/profile/random2.jpg"
        // stock: catelog_data.catalog_stocks.stock ? catelog_data.catalog_stocks.stock.toString() : '1'
      },
      to: '/topics/' + payload.topicName,

    };


    firebaseAdmin.messaging(message).send(payload)
      .then(function (response) {
        return console.log("Successfully sent message:", response);
      })
  },


  sendPushNotification: async (payload) => {
    const usertoken = await commonServices.getAll(DeviceToken, { where: { user_id: payload.userId } })
    if (usertoken.length === 0) {
      console.log("device token doesn't exists")
    } else {
      const devicetoken = usertoken.map(item => {
        return item.device_token
      })
      const message = {
        notification: {
          title: `${payload.title}`,
          body: `${payload.body}`,
        },
        data: {
          redirect_action: payload.redirect_action,
          // id: catelog_data.id ? catelog_data.id.toString() : '1',
          // name: catalog_name,
          image: "http://localhost:8020/uploads/image/profile/random2.jpg",
          // imageUrl: "http://localhost:8020/uploads/image/profile/random2.jpg"
          // stock: catelog_data.catalog_stocks.stock ? catelog_data.catalog_stocks.stock.toString() : '1'
        },
        tokens: devicetoken,
      };

      firebaseAdmin.messaging().sendMulticast(message).then((notifydata) => {
        return console.log('Successfully sent message:', notifydata);
      })
    }
  }
}