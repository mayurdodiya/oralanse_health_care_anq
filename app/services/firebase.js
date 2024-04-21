const db = require('../models');
const { Sequelize } = require('../models');
const { methods: commonServices } = require("./common");
const _ = require("lodash");
const message = require("./message");
const moment = require("moment");
const options = require("../config/options");
const bcrypt = require("bcryptjs");
const Op = db.Sequelize.Op;

const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const auth = getAuth();
const database = getFirestore();

const User = db.users;

// exports.createFirebaseUser = async (data) => {
//   auth.getUserByEmail(data.email).then(async userRecord => {
//     const firebaseId = userRecord.toJSON().uid
//     const userData = await commonServices.update(User, { where: { id: data.userId } }, { firebase_uid: firebaseId })
//   }).catch(err => {
//     auth.createUser({
//       email: data.email,
//       displayName: data.full_name
//     }).then(async userRecord => {
//       const firebaseId = userRecord.uid
//       const userData = await commonServices.update(User, { where: { id: data.userId } }, { firebase_uid: firebaseId })
//     }).catch((error) => {
//       console.log('Error creating new user:', error);
//     });
//   })
// }

// user create in fire base 
exports.createFirebaseUser = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userRecord = await auth.getUserByEmail(data.email);

      const firebaseId = userRecord.toJSON().uid;
      const userData = await commonServices.update(User, { where: { id: data.userId } }, { firebase_uid: firebaseId });

      resolve(firebaseId);
    } catch (error) {
      try {
        const userRecord = await auth.createUser({
          email: data.email,
          displayName: data.full_name,
        });

        const firebaseId = userRecord.uid;
        const userData = await commonServices.update(User, { where: { id: data.userId } }, { firebase_uid: firebaseId });

        resolve(firebaseId);
      } catch (error) {
        console.log('Error creating/updating user:', error);
        reject(error);
      }
    }
  });
};