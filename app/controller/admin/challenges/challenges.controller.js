const db = require("../../../models");
const message = require("../message");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const { methods: contentServices } = require("../../../services/content");
const { logInRes } = require("../auth/common.response");
const Op = db.Sequelize.Op;


const Challenges = db.challenges;
const PatientChallenges = db.patient_challenges;


// add challenge
exports.addChallenge = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { name: req.body.name } };
    const isExistingData = await commonServices.get(Challenges, query);

    if (isExistingData == null) {
      const slug = await commonServices.generateSlug(req.body.name)
      let obj = {
        name: req.body.name,
        description: req.body.description,
        image_path: req.body.image_path,
        slug: slug,
        time: req.body.time,
        credit_points: req.body.credit_points,
        meta_title: req.body.meta_title,
        meta_keywords: req.body.meta_keywords,
        meta_description: req.body.meta_description,
        createdBy: adminId
      }
      const data = await commonServices.create(Challenges, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Challenge"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Challenge") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Challenge") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit challenge by id
exports.updateChallengeById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(Challenges, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This challenge") });
    }

    const query = { where: [{ name: req.body.name }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(Challenges, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This challenge") });
    }

    const obj = {
      name: req.body.name,
      description: req.body.description,
      image_path: req.body.image_path,
      time: req.body.time,
      credit_points: req.body.credit_points,
      meta_title: req.body.meta_title,
      meta_keywords: req.body.meta_keywords,
      meta_description: req.body.meta_description,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Challenges, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Challenge"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Challenge"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete challenge by id
exports.deleteChallengeById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(Challenges, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This challenge") });
    }


    let data = await commonServices.delete(Challenges, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Challenge"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Challenge"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view challenge by id
exports.viewChallengeById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(Challenges, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This challenge") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'description', 'image_path', 'time', 'credit_points', 'meta_title', 'meta_keywords', 'meta_description'],
    };
    let data = await commonServices.get(Challenges, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Challenge"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This Challenge"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all challenge
exports.viewAllChallenge = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { name: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'slug', 'name', 'description', 'image_path', 'time', 'credit_points', 'meta_title', 'meta_keywords', 'meta_description'],
    };

    let data = await commonServices.getAndCountAll(Challenges, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Challenge"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This challenge") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// view all patients challenge
exports.viewAllUserChallenge = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { patient_id: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'patient_id', 'challenge_id', 'status', 'time'],
      include: [
        { model: Challenges, as: "challenges", attributes: ['id', 'name', 'description', 'image_path', 'time', 'credit_points', 'meta_title', 'meta_keywords', 'meta_description'] }
      ],
    };

    let user = await commonServices.getAndCountAll(PatientChallenges, query, limit, offset)
    if (user) {
      const response = commonServices.getPagingData(user, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))
      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Patient challenge"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("Patient challenge") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};

// active/inactive challenge status
exports.updateChallengeStatus = async (req, res) => {
  try {

    const roleId = 3;
    const id = req.params.id;
    const user = await commonServices.get(Challenges, { where: { id: id } });
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("Challenge") });
    }

    const userStatus = user.is_active;
    if (userStatus == true) {
      const status = false
      await contentServices.changeChallengeStatus(id, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Challenge") });
    } else {
      const status = true
      await contentServices.changeChallengeStatus(id, status);
      res.status(200).json({ success: "true", message: message.STATUS_SUCCESS("Challenge") });
    }
  } catch (error) {

    res.status(200).json({ success: "false", message: error.message });
  }
};

// add challenge question
exports.addChallengeQuiz = async (req, res) => {
  try {
    const adminId = req.user.id;
    const query = { where: { question: req.body.question } };
    const isExistingData = await commonServices.get(ChallengeQuiz, query);

    if (isExistingData == null) {

      let obj = {
        challenge_id: req.body.challenge_id,
        question: req.body.question,
        option_type: req.body.option_type,
        option: req.body.option,
        createdBy: adminId
      }
      const data = await commonServices.create(ChallengeQuiz, obj)
      if (data) {
        res.status(200).json({
          success: "true",
          message: message.ADD_DATA("Challenge question"),
        })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Challenge question") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("Challenge question") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit challenge question by id
exports.updateChallengeQuizById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const id = req.params.id
    const user = await commonServices.get(ChallengeQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This challenge question") });
    }

    const query = { where: [{ question: req.body.question }, { id: { [Op.ne]: [id] } }] };
    let isExisting = await commonServices.get(ChallengeQuiz, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This challenge question") });
    }

    const obj = {
      challenge_id: req.body.challenge_id,
      question: req.body.question,
      option_type: req.body.option_type,
      option: req.body.option,
      updatedBy: adminId,
    }
    let data = await commonServices.update(ChallengeQuiz, { where: { id: id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Challenge question"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Challenge question"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete challenge question by id
exports.deleteChallengeQuizById = async (req, res) => {
  try {

    const id = req.params.id
    const user = await commonServices.get(ChallengeQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This challenge question") });
    }


    let data = await commonServices.delete(ChallengeQuiz, { where: { id: id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Challenge question"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Challenge question"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view challenge question by id
exports.viewChallengeQuizById = async (req, res) => {

  try {
    const id = req.params.id;
    const user = await commonServices.get(ChallengeQuiz, { where: { id: id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This challenge question") });
    }

    let query = {
      where: { id: id },
      attributes: ['id', 'challenge_id', 'question', 'option_type', 'option'],
    };

    let data = await commonServices.get(ChallengeQuiz, query)
    const opetion = await JSON.parse(data.option)
    let response = logInRes(data, opetion)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Challenge question"),
        data: response
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This challenge question"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all challenge question
exports.viewAllChallengeQuiz = async (req, res) => {

  try {
    const { page, size, s } = req.query;

    let DataObj = {};
    if (s) {
      DataObj = {
        ...DataObj,
        [Op.or]: [
          { id: { [Op.like]: `%${s}%` } },
          { question: { [Op.like]: `%${s}%` } },
        ]
      }
    }

    const { limit, offset } = commonServices.getPagination(page, size);
    let query = {
      where: [DataObj],
      attributes: ['id', 'challenge_id', 'question', 'option_type', 'option'],
    };

    let user = await commonServices.getAndCountAll(ChallengeQuiz, query, limit, offset)
    if (user) {
      const response = commonServices.getPagingData(user, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      responseData.data.map(item => {
        item.option = JSON.parse(item.option);
      })

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Challenges question"),
        data: responseData
      })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This challenge question") })
    }


  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};