import nodemailer from 'nodemailer';
import {
  invoiceCreatedTemplate,
  paymentReceivedTemplate,
  ownerPaymentReceivedTemplate,
  overdueInvoiceTemplate
} from '../utils/emailTemplates.js';

const hasEmailConfiguration = () =>
  Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASSWORD
  );

let transporter;

const getTransporter = () => {
  if (!hasEmailConfiguration()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  return transporter;
};

const sendEmail = async ({ to, subject, text }) => {
  const emailTransporter = getTransporter();

  if (!emailTransporter) {
    console.warn('Email is not configured. Skipping email notification.');
    return { sent: false, skipped: true };
  }

  const result = await emailTransporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });

  return { sent: true, messageId: result.messageId };
};

const sendInvoiceCreatedEmail = async (data) => {
  const template = invoiceCreatedTemplate(data);
  return sendEmail({ to: data.customerEmail, ...template });
};

const sendPaymentReceivedEmail = async (data) => {
  const template = paymentReceivedTemplate(data);
  return sendEmail({ to: data.customerEmail, ...template });
};

const sendOwnerPaymentReceivedEmail = async (data) => {
  if (!process.env.SHOP_OWNER_EMAIL) {
    console.warn('SHOP_OWNER_EMAIL is not configured. Skipping owner payment notification.');
    return { sent: false, skipped: true };
  }

  const template = ownerPaymentReceivedTemplate(data);
  return sendEmail({ to: process.env.SHOP_OWNER_EMAIL, ...template });
};

const sendOverdueInvoiceEmail = async (data) => {
  const template = overdueInvoiceTemplate(data);
  return sendEmail({ to: data.customerEmail, ...template });
};

export {
  hasEmailConfiguration,
  sendEmail,
  sendInvoiceCreatedEmail,
  sendPaymentReceivedEmail,
  sendOwnerPaymentReceivedEmail,
  sendOverdueInvoiceEmail
};
