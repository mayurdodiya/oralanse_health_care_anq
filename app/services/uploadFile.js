const multer = require('multer');
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const commonConfig = require('../config/common.config')
const AWS = require('aws-sdk');
// const S3 = new AWS.S3( )

var timeDate = '';

module.exports = {
  profileUpload: (req, res) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, `${commonConfig.uploadFilePath}image/profile`);
      },
      filename: function (req, file, cb) {
        timeDate = Date.now();
        cb(null, timeDate + '_' + Math.round(Math.random() * 100000) + path.extname(file.originalname));
      }
    });

    const uploadProfile = multer({
      storage: storage,
      fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          cb(null, false);
          return cb(new Error('Only.png, .jpg and.jpeg format allowed. Please select valid format.!'));
        }
      }
    }).single("file");
    return uploadProfile;
  },
  uploadFileWithAws: async (folderName, file, mediaType, callback) => {
    let s3bucket = new AWS.S3({
      accessKeyId: commonConfig.access_key_id,
      secretAccessKey: commonConfig.secrate_access_key_id,
      region: commonConfig.region
    });
    timeDate = Date.now();
    var params = {
      Bucket: commonConfig.bucketName,
      Key: `${folderName}/` + timeDate + "_" + file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read"
    };
    await s3bucket.upload(params, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { media_type: mediaType, file_path: data.Location });
      }
    })
  },
  uploadMultipleFileWithAws: async (folderName, files, mediaType, callback) => {
    let s3bucket = new AWS.S3({
      accessKeyId: commonConfig.access_key_id,
      secretAccessKey: commonConfig.secrate_access_key_id,
      region: commonConfig.region
    });
    timeDate = Date.now();
    var fileArr = [];
    files.forEach(async file => {
      var params = {
        Bucket: commonConfig.bucketName,
        Key: `${folderName}/` + timeDate + "_" + file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read"
      };
      fileArr.push(
        new Promise((resolve, reject) => {
          s3bucket.upload(params, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve({ media_type: mediaType, file_path: data.Location });
            }
          });
        })
      )
    })
    Promise.all(fileArr)
      .then((locations) => {
        callback(null, locations);
      })
      .catch((err) => {
        callback(err, null);
      });

  }


};
