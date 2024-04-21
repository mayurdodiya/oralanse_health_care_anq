module.exports = {
  nodemailer_auth_username: process.env.nodemailer_auth_username,
  nodemailer_auth_password: process.env.nodemailer_auth_password,
  nodemailer_tls_rejectUnauthorized: process.env.nodemailer_tls_rejectUnauthorized,
  nodemailer_host: process.env.nodemailer_host,
  transport_type: process.env.transport_type,
  partialsDir: process.env.partialsDir,
  uploadFilePath: process.env.uploadFilePath,
  url: process.env.url,
  front_url: process.env.front_url,
  admin_url: process.env.admin_url,
  access_key_id: process.env.access_key_id,
  secrate_access_key_id: process.env.secrate_access_key_id,
  region: process.env.region,
  bucketName: process.env.bucket_name,
  paypal_return_url: process.env.PAYPAL_RETURN_URL,
  paypal_cancel_url: process.env.PAYPAL_CANCEL_URL
}
