module.exports = {
  NO_DATA: (str) => `${str} doesn't exists!`,
  DATA_EXIST: (str) => `${str} already exists!`,
  GET_LIST: (str) => `${str} list has been got successfully!`,
  GET_DATA: (str) => `${str} data has been got successfully!`,
  ADD_DATA: (str) => `${str} data has been added successfully!`,
  ADD_DATA_FAILED: (str) => `${str} data has not been added successfully!`,
  DELETE_PROFILE: (str) => `${str} has been deleted successfully!`,
  APPOINTMENT_REQUEST_SENT: (str) => `${str} has been sent successfully!`,
  APPOINTMENT_REQUEST_SENT_FAILED: (str) => `${str} has not been sent successfully!`,
  APPOINTMENT_REQUEST_EXIST: (str) => `${str} already sent!`,
  REQUEST_LIMIT: (str, num) => `You cann't send more than ${num} ${str} requests!`,
  TRANSACTION_SUCCESS: (str) => `${str} transaction has been done successfully!`,
  VALIDATE_COUPON: "You can use this coupon only once!"
}