import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.PASSEMAIL,
  },
});

/**
 * Function to send an email
 * @param {Object} options - Email details
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body content (HTML format)
 */
export async function sendEmail({ to, subject, html }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

export default sendEmail;
