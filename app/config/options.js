const options = {
  PortalType: {
    PATIENT: "patient",
    DOCTOR: "doctor",
    ORALDOCTOR: "oral_doctor",
    HOSPITAL: "hospital",
    STAFF: "staff",
    NURSE: "nurse",
    PHARAMACIST: "Pharamacist",
    HR: "hr",
    LAB: "lab",
    DENTAL_LAB: "dental_lab",
    DENTAL_CLINIC: "dental_clinic",
    HEALTH_CENTER: "health_center",
  },
  EmployeeType: {
    DOCTOR: "doctor",
    STAFF: "staff",
    NURSE: "nurse",
    PHARAMACIST: "Pharamacist",
    HR: "hr"
  },
  labTestStatus: {
    PENDING: "pending",
    ACCEPT: "accept",
    COMPLETED: "completed",
    DECLINE: "decline",
  },
  pharmacyOrderStatus: {
    REQUESTED: "requested",
    READYTOSHIP: "ready_to_ship",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    DECLINE: "decline",
    COMPLETE: "complete",
  },
  ecomOrderStatus: {
    INPROGRESS: "in_progress",
    INTRANSIT: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled"
  },
  noticeType: {
    DOCTOR: "doctor",
    HOSPITAL: "hospital",
    PATIENT: "patient",
  },
  RelationType: {
    SELF: "self",
    BROTHER: "brother",
    SISTER: "sister",
    HUSBAND: "husband",
    WIFE: "wife",
    MOTHER: "mother",
    FATHER: "father"
  },
  uploadFolder: {
    IMAGE: "images",
    DOCUMENT: "documents",
    USER_DOCUMENT: "userdocument",
    VIDEO: "videos",
    INSURANCE: "insurance",
    APPOINTMENT: "appointment",
    BLOG: "blog",
    PROFILE: "profile",
    STATIC_PAGE: "staticpage"
  },
  appointmentType: {
    VIDEOCALL: "video_call",
    VOICECALL: "voice_call",
    ONLINECHAT: "online_chat",
    INCLINIC: "in_clinic",
    ATHOME: "at_home",
    HOMELABTEST: "home_lab_test",
    CLINICLABTEST: "clinic_lab_test",
    OPD: "opd",
    IPD: "ipd"
  },
  appointmentStatus: {
    REQUESTED: "requested",
    UPCOMING: "upcoming",
    INPROCESS: "in_process",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    RESCHEDULE: "reschedule",
    DECLINE: "decline"
  },
  DoctorStatus: {
    APPROVE: "approve",
    DISAPPROVE: "disapprove",
    PENDING: "pending"
  },
  ClinicStatus: {
    APPROVE: "approved",
    DISAPPROVE: "disapprove",
    PENDING: "pending"
  },
  AmbulanceRequestStatus: {
    PENDING: "pending",
    ACCEPTED: "accept",
    DECLINE: "decline",
    COMPLETED: "completed",
  },
  AmbulanceStatus: {
    ACTIVE: "active",
    OUTOFSERVICES: "out_of_service",
    OFFDUTY: "off_duty",
    ONDUTY: "on_duty",
  },
  ticketStatus: {
    OPENED: 'opened',
    CLOSED: "closed",
  },
  BedAllotmentStatus: {
    OCCUPIED: "occupied",
    VACCANT: "vaccant",
  },
  CoworkingSpaceStatus: {
    PENDING: "pending",
    ACCEPTED: "accepted",
    CANCELLED: "cancelled",
  },
  mediaType: {
    IMAGE: "image",
    VIDEO: "video",
    FILE: "file"
  },
  categoryType: {
    HOSPITAL: "hospital",
    PATIENT: "patient",
    DOCTOR: "doctor"
  },
  pharmacyType: {
    PHARMACY: "pharmacy",
    INVENTORY: "inventory"
  },
  paymentMethod: {
    CASH: "cash",
    RAZORPAY: "razorPay",
    PAYPAL: "payPal"
  },
  paymentType: {
    CREDIT: "credit",
    DEBIT: "debit"
  },
  appointmentPaymentType: {
    CASH: "cash",
    INSURANCE: "insurance"
  },
  appointmentPaymentStatus: {
    PENDING: "pending",
    SUCCESS: "success",
    FAILED: "failed",
  },
  requestType: {
    WITHDRAW: "withdraw",
  },
  txnType: {
    APPOINTMENT: "appointment",
    CONSULTATION: "consultation",
    SALARY: "salary",
    SALES: "sales",
    PURCHASE: "purchase",
    OTHER: "other",
    ECOM: "ecom",
    ORAL_SCREENING: "oral_screening",
    LABREPORT: "lab_report"
  },
  paymentStatus: {
    PAID: "paid",
    PENDING: "pending",
    COMPLETED: "completed"
  },
  staffPayoutStatus: {
    PAID: "paid",
    PENDING: "pending",
  },
  transactionStatus: {
    SUCCESS: "success",
    PENDING: "pending",
    FAILED: "failed"
  },
  jobStatus: {
    APPLIED: "applied"
  },
  challengeStatus: {
    ACTIVE: "active",
    COMPLETED: "completed"
  },
  machineStatus: {
    MALFUNCTION: "malfunction",
    OPERATIONAL: "operational",
    INREPAIR: "in_repair",
    BROKEN: "broken"
  },
  settingGroup: {
    EMAIL: 'email',
    SMS: 'sms',
    WHATSAPP: 'whatsapp',
    GENERAL: 'general',
    PAYMENT_GATEWAY: 'payment_gateway',
  },
  settingKey: {
    CIGARETTE_PRICE: 'cigarettes_price',
    RZP_TEST_KEY: 'razorpay_test_key',
    RZP_TEST_SECRET: 'razoypay_test_secret',
    RZP_LIVE_KEY: 'razorpay_live_key',
    RZP_LIVE_SECRET: 'razoypay_live_secret',
    PYL_TEST_KEY: 'paypal_test_key',
    PYL_TEST_SECRET: 'paypal_test_secret',
    PYL_LIVE_KEY: 'paypal_live_key',
    PYL_LIVE_SECRET: 'paypal_live_secret',
    CONSULT_FEE: 'consultation_fee',
    ADMIN_FEE: 'admin_fee',
    REVIEW_POINT: 'review_point',
    USD_RATE: 'usd_rate',
    OTP: 'otp',
    LOGIN: 'login',
    FORGOTPWD: 'forgot_pwd',
    ONBOARDING: "onboarding",
    PROFILEAPPROVE: "profile_approve",
    ORAL_SCREENING_FEES: 'oral_screening_fees',
    AMBULANCE_REQUEST: 'ambulance_request',
    CLINIC_AMBULANCE_REQUEST: 'clinic_ambulance_request',
    ORDER_SUCCESS: 'order_generated',
    ADMIN_ORDER_NOTIFY: 'admin_order_notify',
    ORDER_STATUS: 'order_status',
    STAFF_SCHEDULING_DUTY: 'staff_scheduling_duty',
  },
  facialSpeciality: {
    COSMETOLOGY: 'Cosmetology',
    DERMATOLOGY: 'Dermatology',
    PLASTIC_SURGERY: 'Plastic & Reconstructive Surgery'
  },
  appointmentLimit: {
    DOCTOR_SELECTION: 10,
    HOSPITAL_SELECTION: 10
  },
  oralScreeningReportStatus: {
    PENDING: "pending",
    ASSIGNED: "assigned",
    QA: "qa",
    QAASSIGNED: "qa_assigned",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  },
  DateFormat: {
    DATETIME: "DD MMM YYYY, h:mm a",
    DAYDATETIME: "dddd, MMMM Do YYYY, h:mm:ss a",
    DATE: "DD MMMM YYYY",
    TIME: "hh:mm A",
  },
  activeNotifyFlag: {
    SEND_MAIL: true,
    SEND_SMS: false,
    SEND_PUSH_NOTIFICATION: true,
    SEND_WP_MSG: false
  },
  oralScreeningType: {
    PAID: "paid",
    FREE: "free"
  },
  jitsiRoomType: {
    CALL: 'call',
    VIDEO: 'video'
  },
  deviceType: {
    WEB: "web",
    APP: "app"
  }

}

module.exports = options