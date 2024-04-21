const db = require("../../../../models");
const { methods: commonServices } = require("../../../../services/common");
const message = require("../../message");
const CancerAssistance = db.cancer_assistances;


//get all cancer assitance list
exports.getAllCancerAssistance = async (req, res) => {
  try {
    const userId = req.user.id
    let query = {
      attributes: ["id", "title", "sub_title", "image_path", "slug", "meta_title", "meta_keywords", "meta_description"],
    }
    const staticData = await commonServices.getAll(CancerAssistance, query)
    var response = JSON.parse(JSON.stringify(staticData))
    return res.status(200).json({ success: "true", message: message.GET_LIST("Data"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}

//view cancer assistance by id
exports.viewCancerAssitanceById = async (req, res) => {
  try {
    const userId = req.user.id;
    const slug = req.params.slug;
    let query = {
      where: { slug: slug },
      attributes: ["id", "title", "sub_title", "description", "image_path", "slug", "meta_title", "meta_keywords", "meta_description"],
    }
    const staticData = await commonServices.get(CancerAssistance, query)
    var response = JSON.parse(JSON.stringify(staticData))
    return res.status(200).json({ success: "true", message: message.GET_DATA("Cancer Assistance"), data: response })
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message })
  }
}