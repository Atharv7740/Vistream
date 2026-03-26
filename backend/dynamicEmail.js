const nodemailer = require("nodemailer");
const dontenv = require("dotenv");
dontenv.config();
const path = require("path");
const fs = require("fs");

// --- 1. Define Dynamic Data ---
const userData = {
  name: "Atharv Tripathi",
  otp: "654321",
  companyName: "TransporterPro",
  helpLink: "https://transporterPro.com/help",
  recipientEmail: "transporterPro@gamil.com",
};

const createMssg = (templateName, Data) => {
  const templatePath = path.join(__dirname, templateName);

  let htmlString = fs.readFileSync(templatePath, "utf-8");

  for (let key in Data) {
    const placeholder = new RegExp(`{{${key}}}`, `g`);
    htmlString = htmlString.replace(placeholder, Data[key]);
  }

  return htmlString;
};


async function sendEmail(templateName, reciverEmail, userData) {
  try {
    /*** Create Transporter *****/
    const gmailTransporter = {
      service: "gmail",
      auth: {
        user: "transporter.inventory.management@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    };
    const transporter = nodemailer.createTransport(gmailTransporter);

    /*** Get updated Html Content and creating mssg ******/
    const updatedHtmlContent = createMssg(templateName, userData);

    const msg = {
      to: reciverEmail,
      from: "transporter.inventory.management@gmail.com",
      subject: "Sending email through Gmail using NodeMailer",
      html: updatedHtmlContent
    };


    /************* Send Mail***********/
    const info = await transporter.sendMail(msg);
    console.log("Mail Sent! Check the Gmail");
  } catch (err) {
    console.log("error Occured while sending Email", err);
  }


}


module.exports = sendEmail;
