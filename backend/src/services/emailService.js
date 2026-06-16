import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let transporter = null;

function getTransporter() {
  if (!config.email.enabled) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: { user: config.email.user, pass: config.email.pass },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!config.email.enabled) {
    logger.info(`[Email skipped] To: ${to} | Subject: ${subject}`);
    return { sent: false, simulated: true };
  }
  const transport = getTransporter();
  await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''),
  });
  return { sent: true };
}

export async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to MBA Path Pro',
    html: `<h2>Welcome, ${user.name}!</h2><p>Your MBA admission journey starts now. Login at ${config.clientUrl}/login</p>`,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const link = `${config.clientUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your MBA Path Pro password',
    html: `<p>Hi ${user.name},</p><p><a href="${link}">Reset your password</a>. Link expires in 1 hour.</p>`,
  });
}

export async function sendApplicationUpdateEmail(user, title, message) {
  return sendEmail({
    to: user.email,
    subject: `Application Update: ${title}`,
    html: `<p>${message}</p><p><a href="${config.clientUrl}/student/applications">View applications</a></p>`,
  });
}

export async function sendPaymentConfirmationEmail(user, amount, invoiceNumber) {
  return sendEmail({
    to: user.email,
    subject: 'Payment Confirmation - MBA Path Pro',
    html: `<p>Payment of ₹${amount} received. Invoice: ${invoiceNumber}</p>`,
  });
}
