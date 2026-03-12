import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const mailService = {
  async sendVerificationEmail(email: string, name: string, token: string) {
    const url = `${env.CLIENT_URL}/auth/confirm-email?token=${token}`;

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Confirm your email",
      html: `
        <h2>Hello, ${name}!</h2>
        <p>Click the button below to confirm your email address:</p>
        <a href="${url}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #0d6efd;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        ">Confirm Email</a>
        <p>Link expires in 24 hours.</p>
        <p>If you didn't register, ignore this email.</p>
      `,
    });
  },
};
