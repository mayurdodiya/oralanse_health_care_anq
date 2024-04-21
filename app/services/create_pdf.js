const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const commonConfig = require("../config/common.config");



const methods = {
    createPDF: async (data) => {
        var templateHtml = fs.readFileSync(`${commonConfig.partialsDir}sendOtp_copy.html`, { encoding: 'utf8', flag: 'r' });
        var template = handlebars.compile(templateHtml, { strict: true });
        var html = template(data);
        var milis = new Date();
        milis = milis.getTime();

        var pdfPath = path.join(`${commonConfig.uploadFilePath}images/file/`, `${milis}.pdf`);
        var options = {
            width: '2000px',
            scale: 1,
            headerTemplate: "<p></p>",
            footerTemplate: "<p></p>",
            displayHeaderFooter: false, 
            margin: {
                bottom: "30px",
            },
            printBackground: true,
            path: pdfPath,
            format: 'a2'
        }
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            headless: 'new'
        })
        const page = await browser.newPage()
        await page.setContent(html)
        // await page.addStyleTag({ path: "public/css/style.css" });
        await page.pdf(options)
        return pdfPath
    }
}

module.exports = { methods }