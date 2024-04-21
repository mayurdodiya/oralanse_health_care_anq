const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');
const path = require("path");
const commonConfig = require("../config/common.config");


module.exports = {
  sendMail: function (mailobj) {
    if (commonConfig.transport_type == "smtp") {
      var transporter = nodemailer.createTransport({
        host: commonConfig.nodemailer_host,
        port: 587,
        secure: false, // upgrade later with STARTTLS
        auth: {
          user: commonConfig.nodemailer_auth_username,
          pass: commonConfig.nodemailer_auth_password,
        },
        tls: {
          rejectUnauthorized: commonConfig.nodemailer_tls_rejectUnauthorized,
        }
      });
    } else if (commonConfig.transport_type == "gmail") {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: commonConfig.nodemailer_auth_username,
          pass: commonConfig.nodemailer_auth_password
        }
      });
    }

    const handlebarOptions = {
      viewEngine: {
        extName: '.handlebars',
        defaultLayout: '',
        partialsDir: path.resolve(commonConfig.partialsDir),
        layoutsDir: path.join(commonConfig.partialsDir),
      },
      viewPath: path.resolve(commonConfig.partialsDir),
      extName: '.handlebars',
    };

    transporter.use('compile', hbs(handlebarOptions));

    transporter.sendMail(mailobj).then(info => {
      // return console.log("info : ", info)
    }).catch(err => {
      console.log(err)
    })

  },

};