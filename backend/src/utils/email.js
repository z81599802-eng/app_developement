import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendResetEmail = async ({ to, link }) => {
  const message = {
    from: `No Reply <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
      <p>You requested to reset your password.</p>
      <p>Click the link below to set a new password. This link expires in 1 hour.</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `
  };

  await transporter.sendMail(message);
};
