const db = require("../../../../models");
const { methods: commonServices, getUsedRate } = require("../../../../services/common");
const faqService = require("./service")
const OpenAI = require("openai");
const emailServices = require("../../../../services/email")
const message = require("../../message");
const options = require('../../../../config/options');
const _ = require("lodash");
const commonConfig = require("../../../../config/common.config");
const AIScreeningService = require("./service")
const { methods: ecommerceService } = require("../../../../services/ecommerce")
const Op = db.Sequelize.Op;

const OralScreeningQuiz = db.oral_screening_quiz;
const OralScreeningAnswer = db.oral_screening_answers;
const OralScreeningMedia = db.oral_screening_medias;
const OralScreeningReport = db.oral_screening_reports;
const Setting = db.settings;
const Patient = db.patients;
const User = db.users

const options123 = [
  { id: 1, options: ["Poor oral hygiene", "Excessive brushing", "Consuming too much fluoride", "Genetics"] },
  { id: 2, options: ["Tooth sensitivity", "Tooth discoloration", "Bleeding gums", "Bad breath"] },
  { id: 3, options: ["Gingivitis", "Cavity", "Periodontitis", "Halitosis"] }
];
function generateCombinations(options123, currentCombination = [], currentIndex = 0, allCombinations = []) {
  if (currentIndex === options123.length) {
    allCombinations.push(currentCombination.slice());
  } else {
    for (const option of options123[currentIndex].options) {
      currentCombination.push(option);
      generateCombinations(options123, currentCombination, currentIndex + 1, allCombinations);
      currentCombination.pop();
    }
  }
  return allCombinations;
}
const allCombinations = generateCombinations(options123);

//check oral screening is paid or free
exports.getOralScreeningType = async (req, res) => {
  try {
    const userId = req.user.id;
    const patientId = req.user.patients.id
    const screeningReport = await commonServices.get(OralScreeningReport, { where: { user_id: userId }, order: [['createdAt', 'DESC']], })
    let screeningType = {}
    if (screeningReport) {
      screeningType.is_free = false
      if (screeningReport.status == options.oralScreeningReportStatus.PENDING && screeningReport.order_number !== null) {
        screeningType.isPaymentDone = true
      }
      return res.status(200).json({ success: "true", message: message.DATA_EXIST("Screening Report"), data: screeningType })
    } else {
      screeningType.is_free = true
      return res.status(200).json({ success: "true", message: message.DATA_EXIST("ScreeningReport"), data: screeningType })
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//get Selfi Scan AI screening quiz list
exports.getAiScreeningQuiz = async (req, res) => {
  try {
    const userId = req.user.id
    const oralQuiz = await commonServices.getAll(OralScreeningQuiz, { attributes: ["id", "question", "option_type", "options"] })
    oralQuiz.map(item => {
      item.options = JSON.parse(item.options)
    })
    return res.status(200).json({ success: "true", message: message.GET_LIST("Question"), data: oralQuiz })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//create oral screening payment
exports.createOralScreeningPayment = async (req, res) => {
  try {
    const userId = req.user.id
    const patientId = req.body.patient_id
    const { method, deviceType } = req.query
    const ScreeningFee = await commonServices.get(Setting, { where: { group: options.settingGroup.GENERAL, s_key: options.settingKey.ORAL_SCREENING_FEES } })
    const payAmount = parseFloat(ScreeningFee.value);
    const usdAmount = await getUsedRate()
    const receipt = commonServices.generateUniqueId(20);
    if (method == options.paymentMethod.RAZORPAY) {
      const paymentData = await ecommerceService.createRazorPayOrder(payAmount * usdAmount, 'INR', receipt)
      if (!paymentData) {
        return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
      }
      const screeningOrder = await AIScreeningService.createScreeningOrder({ userId, patientId, order_number: paymentData.id, payment_method: method, amount: payAmount })
      if (!screeningOrder) {
        return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
      }
      return res.status(200).json({ success: "true", message: message.ORDER_SUCCESS("Your"), data: paymentData })
    }
    if (method == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.WEB) {
        const paymentData = await ecommerceService.createPaypalPayment({ amount: payAmount })
        const screeningOrder = await AIScreeningService.createScreeningOrder({ userId, patientId, order_number: `order_${paymentData.id}`, payment_method: method, amount: payAmount })
        if (!screeningOrder) {
          return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
        }
        return res.status(200).json({ success: "true", message: message.PAYMENT_SUCCESS("Your"), data: paymentData })
      } else if (deviceType == options.deviceType.APP) {
        const screeningOrder = await AIScreeningService.createScreeningOrder({ userId, patientId, order_number: `order_${commonServices.generateUniqueId(14)}`, payment_method: method, amount: payAmount })
        if (!screeningOrder) {
          return res.status(200).json({ success: "false", message: message.ORDER_FAILED("Your") })
        }
      }

    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error })
  }
}

//verify screening payment
exports.verifyScreeningPayment = async (req, res) => {
  try {
    const userId = req.user.id
    const { method, paymentId, order_id, deviceType } = req.query

    if (method == options.paymentMethod.RAZORPAY) {
      var verifyPayment = await ecommerceService.verifyRazorpayOrder(req, { order_id, payment_id: paymentId })
      if (verifyPayment === true) {
        const ecomTransaction = await ecommerceService.createTransaction({
          userId,
          paymentMethod: method,
          paymentType: options.paymentType.DEBIT,
          txnType: options.txnType.ORAL_SCREENING,
          payment_id: paymentId,
          ...req.body,
          ...req.query
        })
        if (!ecomTransaction) {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        }
        return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
      } else {
        return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
      }
    }
    if (method == options.paymentMethod.PAYPAL) {
      if (deviceType == options.deviceType.WEB) {
        var verifyPayment = await ecommerceService.executePaypalPayment({ order_id })
        if (verifyPayment != null) {
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: method,
            paymentType: options.paymentType.DEBIT,
            txnType: options.txnType.ORAL_SCREENING,
            payment_id: paymentId,
            ...req.body,
            ...req.query
          })
          if (!ecomTransaction) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }
          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        } else {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        }
      } else if (deviceType == options.deviceType.APP) {
        var verifyPayment = await ecommerceService.verifyMobilePaypalMayment({ paymentId })
        var payment_state = verifyPayment.state;
        var transaction_server = verifyPayment.transactions[0];
        var slale_state_server = transaction_server.related_resources[0].sale.state;
        if (slale_state_server !== "completed") {
          return res.status(200).json({ success: "false", message: message.NO_PAYPAL_SALE })
        }
        if (payment_state !== "approved") {
          return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
        } else {
          const ecomTransaction = await ecommerceService.createTransaction({
            userId,
            paymentMethod: method,
            paymentType: options.paymentType.DEBIT,
            txnType: options.txnType.ORAL_SCREENING,
            payment_id: paymentId,
            ...req.body,
            ...req.query
          })
          if (!ecomTransaction) {
            return res.status(200).json({ success: "false", message: message.PAYMENT_FAILED })
          }
          return res.status(200).json({ success: "true", message: message.TRANSACTION_SUCCESS("The payment") })
        }
      } else {
        return res.status(200).json({ success: "false", message: message.NO_DATA("Device type") })
      }
    }
  } catch (error) {
    return res.status(200).json({ success: "false", message: error.message })
  }
}

//add oral screening answer
exports.submitOralQuizAnswer = async (req, res) => {
  try {
    const userId = req.user.id;
    const screeningType = req.query.type
    let answerArr = req.body.answer;
    let mediaArr = req.body.media;

    if (screeningType == options.oralScreeningType.FREE) {
      const screeningReport = await commonServices.get(OralScreeningReport, { where: { user_id: userId } })
      if (screeningReport) {
        res.status(200).json({ success: "false", message: message.NO_FREE_REPORT })
      } else {
        const oralScreeningReport = await commonServices.create(OralScreeningReport, {
          user_id: userId,
          patient_id: req.user.patients.id,
          status: options.oralScreeningReportStatus.PENDING,
          screening_type: options.oralScreeningType.FREE,
          createdBy: userId
        })
        if (!oralScreeningReport) {
          return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Oral screening") })
        }

        answerArr = answerArr.map(i => {
          return {
            user_id: userId,
            oral_screening_report_id: oralScreeningReport.id,
            question_id: i.id,
            answers: i.answers,
            createdBy: userId
          }
        })
        const answerRes = await commonServices.bulkCreate(OralScreeningAnswer, answerArr)
        if (answerRes.length == 0) {
          return res.status(200).json({ success: "false", message: message.ADD_DATA_FAILED("Answer") })
        }
        const oralSubmitedAnswer = await commonServices.getAll(OralScreeningAnswer, { where: { oral_screening_report_id: oralScreeningReport.id }, include: [{ model: OralScreeningQuiz, as: "oral_screening_quiz" }] })
        let answerModify = JSON.parse(JSON.stringify(oralSubmitedAnswer))
        answerModify = answerModify.map(item => {
          return {
            "id": item.question_id,
            "question": item.oral_screening_quiz.question,
            "answers": JSON.parse(item.answers)
          }
        })
        const reportRes = await AIScreeningService.createOralScreeningReport(answerModify)
        const mergedDiseasesInformation = reportRes.reduce((mergedArray, item) => {
          const mergedDiseases = mergedArray.concat(item.diseasesInformation);
          const uniqueMergedDiseases = Array.from(new Map(mergedDiseases.map(entry => [JSON.stringify(entry), entry])).values());
          return uniqueMergedDiseases;
        }, []);
        await commonServices.update(OralScreeningReport, { where: { id: oralScreeningReport.id } }, { status: options.oralScreeningReportStatus.COMPLETED, ai_response: mergedDiseasesInformation })
        return res.status(200).json({ success: "true", message: message.ADD_DATA("Oral screening report"), data: mergedDiseasesInformation })
      }
    } else if (screeningType == options.oralScreeningType.PAID) {
      const screeningReport = await commonServices.get(OralScreeningReport, { where: { user_id: userId, status: options.oralScreeningReportStatus.PENDING } })
      if (screeningReport) {
        answerArr = answerArr.map(i => {
          return {
            user_id: userId,
            oral_screening_report_id: screeningReport.id,
            question_id: i.id,
            answers: i.answers,
            createdBy: userId
          }
        })
        const answerRes = await commonServices.bulkCreate(OralScreeningAnswer, answerArr)
        mediaArr = mediaArr.map(i => {
          return {
            oral_screening_report_id: screeningReport.id,
            image_type: i.image_type,
            image_url: i.image_url,
            createdBy: userId
          }
        })
        const mediaRes = await commonServices.bulkCreate(OralScreeningMedia, mediaArr)
      }
      return res.status(200).json({ success: "true", message: message.ADD_DATA("Oral screening eport"), data: screeningReport })
    } else {
      return res.status(200).json({ success: "false", message: message.SOME_ERROR })
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//get all screening report
exports.getAllScreeningReport = async (req, res) => {
  try {
    const userId = req.user.id
    const { page, size, s, status } = req.query
    var statusCondition = status ? { status: status } : ""
    var searchData = {};
    if (s) {
      searchData = {
        ...searchData,
        [Op.or]: [
          { '$patientScreening.unique_id$': { [Op.like]: `%${s}%` } },
          { '$patientScreening.full_name$': { [Op.like]: `%${s}%` } },
          { status: { [Op.like]: `%${s}%` } },
          { screening_type: { [Op.like]: `%${s}%` } },
        ]
      }
    }
    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: { user_id: userId, ...searchData, ...statusCondition },
      order: [['createdAt', 'DESC']],
      attributes: ["id", "user_id", "patient_id", "status", "screening_type", "createdAt"],
      include: [{ model: Patient, as: "patientScreening", attributes: ["id", "unique_id", "full_name", "profile_image", "age", "gender"] }]
    }
    const screeningData = await commonServices.getAndCountAll(OralScreeningReport, query, limit, offset)
    const responseData = commonServices.getPagingData(screeningData, page, limit);
    var response = JSON.parse(JSON.stringify(responseData))
    return res.status(200).json({ success: "true", message: message.GET_LIST("Screening report"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//view screening report by id
exports.viewScreeningReportById = async (req, res) => {
  try {
    const userId = req.user.id
    const screeningId = req.params.id
    let query = {
      where: { id: screeningId },
      attributes: ["id", "user_id", "patient_id", "status", "screening_type", "createdAt", "ai_response"],
      include: [{ model: Patient, as: "patientScreening", attributes: ["id", "unique_id", "full_name", "profile_image", "age", "gender"] }]
    }
    const screeningData = await commonServices.get(OralScreeningReport, query)
    var response = JSON.parse(JSON.stringify(screeningData))
    response.ai_response = JSON.parse(response.ai_response)
    return res.status(200).json({ success: "true", message: message.GET_DATA("Screening report"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}