import nodemailer from "nodemailer";

const sendEmail = async (to, subject, htmlContent) => {
  // Create transporter when sending email to ensure env vars are loaded
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `Shivam maurya chat app <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });

  return info;
};

export default sendEmail;
