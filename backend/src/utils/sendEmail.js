import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT) || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
  // secure: false (default for port 2525)
});

export const sendEmail = async (to, subject, htmlOrText) => {
  try {
    const info = await transporter.sendMail({
      from: '"Volunteer Portal" <no-reply@volunteer-portal.test>',
      to, // any "to" is fine — Mailtrap will capture it
      subject,
      html: htmlOrText, // you can pass plain text or HTML
    });
    console.log("Mail sent (Mailtrap):", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};
