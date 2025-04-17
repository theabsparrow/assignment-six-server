import nodemailer from "nodemailer";
import config from "../config";
import { TEMailSend, TmailOptions } from "../interface/sendEmail";

export const sendEmail = async ({ to, html, subject, text }: TEMailSend) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp_host as string,
    port: Number(config.smtp_port),
    secure: false,
    auth: {
      user: config.email_sent_from as string,
      pass: config.email_app_password as string,
    },
  });

  const mailOptions: TmailOptions = {
    from: "DailyDish",
    to,
    subject,
    text,
  };

  if (html) {
    mailOptions.html = html;
  }

  return await transporter.sendMail(mailOptions);
};
