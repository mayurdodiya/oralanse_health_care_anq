const db = require("../../../models");
const message = require("../message");
const { methods: createPdfServices } = require("../../../services/create_pdf");
const { methods: commonServices, pincodeExist } = require('../../../services/common');
const Op = db.Sequelize.Op;




const Areas = db.areas;
const Cities = db.cities;



// add areas
exports.addAreas = async (req, res) => {
  try {
    const adminId = req.user.id;

    let isData = await commonServices.get(Cities, { where: { id: req.body.city_id } });
    if (!isData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This city") });
    }

    const query = { where: { pincode: req.body.pincode } };
    const isExistingData = await commonServices.get(Areas, query);

    if (isExistingData == null) {

      let obj = {
        city_id: req.body.city_id,
        name: req.body.name.toLowerCase(),
        pincode: req.body.pincode,
        createdBy: adminId
      }
      const data = await commonServices.create(Areas, obj)
      if (data) {
        res.status(200).json({ success: "true", message: message.ADD_DATA("Area"), })
      } else {
        res.status(200).json({ success: "false", message: message.CREATE_FAILD("Area") });
      }

    } else {
      res.status(200).json({ success: "false", message: message.DATA_EXIST("This pincode") });
    }

  } catch (error) {

    res.status(200).json({ success: " false", message: error.message });
  }
}

// edit areas by id
exports.updateAreasById = async (req, res) => {
  try {

    const adminId = req.user.id;
    const user = await commonServices.get(Cities, { where: { id: req.body.city_id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This city") });
    }

    const userData = await commonServices.get(Areas, { where: { id: req.params.id } })
    if (!userData) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This area") });
    }

    const query = { where: [{ pincode: req.body.pincode }, { id: { [Op.ne]: req.params.id } }] };
    let isExisting = await commonServices.get(Areas, query);
    if (isExisting) {
      return res.status(200).json({ success: "false", message: message.DATA_EXIST("This pincode") });
    }

    const obj = {
      city_id: req.body.city_id,
      name: req.body.name.toLowerCase(),
      pincode: req.body.pincode,
      updatedBy: adminId,
    }
    let data = await commonServices.update(Areas, { where: { id: req.params.id } }, obj);
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.UPDATE_PROFILE("Area"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_UPDATE("Area"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// delete areas by id
exports.deleteAreasById = async (req, res) => {
  try {

    const user = await commonServices.get(Areas, { where: { id: req.params.id } })
    if (!user) {
      return res.status(200).json({ success: "false", message: message.NO_DATA("This area") });
    }


    let data = await commonServices.delete(Areas, { where: { id: req.params.id } });
    if (data > 0) {
      res.status(200).json({
        success: "true",
        message: message.DELETED_SUCCESS("Area"),
      });
    } else {
      res.status(200).json({
        success: "false",
        message: message.NOT_DELETED("Area"),
      });
    }
  } catch (error) {
    res.status(200).json({ success: "false", message: error.message });
  }
}

// view areas by id
exports.viewAreasById = async (req, res) => {

  try {
    const id = req.params.id;

    let query = {
      where: { id: id },
      attributes: ['id', 'name', 'pincode'],
      include: [
        { model: Cities, as: "cities", attributes: ['id', 'city_name', 'state_name', 'country_name',] }
      ]
    };
    let data = await commonServices.get(Areas, query)

    if (data) {

      res.status(200).json({
        success: "true",
        message: message.GET_DATA("Area"),
        data: data
      })
    } else {
      res.status(200).json({
        success: "true",
        message: message.NO_DATA("This area"),
      })
    }

  } catch (error) {

    res.status(200).json({ success: "false", message: error.message })
  }

};

// view all areas
exports.viewAllAreas = async (req, res) => {

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
      order: [["id", "DESC"], ["createdAt", "DESC"]],
      attributes: ['id', 'name', 'pincode'],
      include: [
        { model: Cities, as: "cities", attributes: ['id', 'city_name', 'state_name', 'country_name',] }
      ]
    };


    let data = await commonServices.getAndCountAll(Areas, query, limit, offset)
    if (data) {
      const response = commonServices.getPagingData(data, page, limit);
      let responseData = JSON.parse(JSON.stringify(response))

      res.status(200).json({ success: "true", message: message.GET_DATA("Area"), data: responseData })
    } else {
      res.status(200).json({ success: "false", message: message.NO_DATA("This area") })
    }

  } catch (error) {
    res.status(200).json({ success: " false", message: error.message })
  }

};


// // create pdf ------------
// exports.createPdf = async (req, res) => {
//   try {
//     const puppeteer = require('puppeteer')
//     console.log("----------------------------------------------------------------------------");

//     // // async function printPDF() {
//     //   const browser = await puppeteer.launch({ headless: true });
//     //   const page = await browser.newPage();
//     //   await page.goto('https://blog.risingstack.com', { waitUntil: 'networkidle0' });
//     //   const pdf = await page.pdf({ format: 'A4' });

//     //   await browser.close();
//     //   console.log(pdf);
//     //   return res.status(200).json({ success: "true", message: "pdg generated", data: pdf })
//     // // }

//     async function createPDF() {
//       // Launch a headless browser
//       const browser = await puppeteer.launch();

//       // Create a new page
//       const page = await browser.newPage();

//       // Navigate to a URL or load local HTML content
//       // await page.goto('https://example.com');
//       // await page.goto('My name is mayur Dodidya');

//       // Wait for any additional content to load, if needed
//       // await page.waitForTimeout(2000);

//       // Generate PDF from the page
//       const pdf = await page.pdf({
//         path: 'output.pdf',
//         format: 'A4',
//         printBackground: true,
//       });

//       // Close the browser
//       await browser.close();

//       console.log('PDF created successfully.', pdf);
//       return res.status(200).json({ success: "true", message: "pdg generated", data: pdf })
//     }

//     // Call the function to create the PDF
//     createPDF();


//   } catch (error) {
//     console.log(error);
//     return res.status(200).json({ success: " false", message: error.message })
//   }
// }

// create pdf ----------------
exports.createPdf = async (req, res) => {
  try {
    const data = await createPdfServices.createPDF({ username: "John" })
    console.log(data), "success";

  } catch (error) {
    console.log(error);
    return res.status(200).json({ success: " false", message: error.message })
  }
}