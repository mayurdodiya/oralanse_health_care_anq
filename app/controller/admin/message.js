module.exports = {

    DATA_EXIST: (str) => `${str} already exist!`,
    NO_DATA: (str) => `${str} doesn't exists!`,
    GET_LIST: (str) => `${str} list has been got successfully!`,
    UPDATE_PROFILE: (str) => `${str} has been updated successfully!`,
    NOT_UPDATE: (str) => `${str} doesn't updated!`,
    ADD_DATA: (str) => `${str} data has been added successfully!`,
    CREATE_FAILD: (str) => `${str} data add not successfully!`,
    PHONENO_EXIST: (str) => `${str} phone no already exists!`,
    EMAIL_EXIST: (str) => `${str} email already exists!`,
    DELETED_SUCCESS: (str) => `${str} deleted successfully!`,
    NOT_DELETED: (str) => `${str} not deleted!`,
    GET_DATA: (str) => `${str} has been got successfully!`,
    NO_RESET_TOKEN: "Reset password token is invalid or expired. Or may be not found. Please try the reset password process again!",
    LOGIN_SUCCESS: "You have logged in successfully!",
    LOGIN_FAILED: "Your logged in failed. please try again!",
    LOGOUT_SUCCESS: "You have logout successfully!",
    LOGOUT_FAILED: "You have not logged out successfully!",
    INVALID: (str) => `${str} is invalid`,
    STATUS_SUCCESS: (str) => `${str} status has been changed successfully!`,
    STATUS_FAILED: (str) => `${str} status has not been changed successfully!`,
    RECHEDULE_SUCCESS: (str) => `${str} has been reschedule successfully!`,
    RECHEDULE_FAILD: (str) => `${str}  not reschedule successfully!`,
    VALIDATION_NECESSARY: (str) => `${str} is required!`,
    VALIDATION_ISARRAY: (str) => `${str} must be an array!`,
    NO_FILE: "Please, select file for upload!",
    UPLOAD_FILE_SUCCESS: "The file has been uploaded successfully!",
    CHANGE_DATA: (str) => `${str} has been changed successfully!`,
    CHANGE_DATA_FAILED: (str) => `${str} has not been changed successfully!`,
    VALIDATION_NECESSARY: (str) => `${str} is required!`,
    REQUEST_SENT: (str) => `${str} has been sent successfully!`,
    REQUEST_SENT_FAILED: (str) => `${str} has not been sent successfully!`,
    REQUEST_EXIST: (str) => `${str} already sent!`,
    NOT_MATCH: (str) => `${str} does not match!`,
}