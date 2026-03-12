/**
 * emailService.js
 *
 * Centralised email sending utility using Nodemailer.
 * Supports SMTP (e.g. Gmail, SendGrid, Mailgun) via env vars.
 *
 * Required env vars:
 *   EMAIL_HOST      - SMTP host (e.g. smtp.sendgrid.net, smtp.gmail.com)
 *   EMAIL_PORT      - SMTP port (e.g. 587 for TLS, 465 for SSL)
 *   EMAIL_USER      - SMTP auth username
 *   EMAIL_PASS      - SMTP auth password / API key
 *   EMAIL_FROM      - Sender address (e.g. "JanUmang <no-reply@yourdomain.com>")
 *   FRONTEND_URL    - Used to build links in email templates
 */

const nodemailer = require("nodemailer");

// ── Transporter ────────────────────────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: parseInt(process.env.EMAIL_PORT || "587", 10) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ── Core sender ────────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "JanUmang <no-reply@janumangsaas.com>",
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ""), // Fallback plain-text strip
  };

  const info = await transporter.sendMail(mailOptions);

  if (process.env.NODE_ENV === "development") {
    console.log(`[EMAIL] Sent to ${to}: ${subject} (ID: ${info.messageId})`);
  }

  return info;
};

// ── Template: Forgot Password ──────────────────────────────────────────────────
const sendPasswordResetEmail = async ({ to, name, resetToken }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #008080; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">JanUmang</h1>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #555;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555;">We received a request to reset the password for your JanUmang account. Click the button below to set a new password.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
             style="background: #008080; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; margin: 0;">If the button above doesn't work, copy and paste this URL into your browser:<br/>
          <a href="${resetUrl}" style="color: #008080;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Reset Your JanUmang Password",
    html,
  });
};

// ── Template: Email Verification ──────────────────────────────────────────────
const sendEmailVerification = async ({ to, name, verificationToken }) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #008080; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">JanUmang</h1>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
        <p style="color: #555;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555;">Thanks for signing up! Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}"
             style="background: #008080; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">This link expires in <strong>24 hours</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #aaa; font-size: 12px; margin: 0;">If the button above doesn't work, copy and paste this URL into your browser:<br/>
          <a href="${verifyUrl}" style="color: #008080;">${verifyUrl}</a>
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Verify Your JanUmang Email Address",
    html,
  });
};

// ── Template: Trial Expiry Warning ────────────────────────────────────────────
const sendTrialExpiryWarning = async ({ to, name, orgName, daysLeft }) => {
  const contactUrl = `${process.env.FRONTEND_URL}/subscription`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #d97706; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">JanUmang</h1>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #d97706; margin-top: 0;">⚠️ Your Trial Expires in ${daysLeft} Day${daysLeft !== 1 ? "s" : ""}</h2>
        <p style="color: #555;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555;">Your free trial for <strong>${orgName}</strong> expires in <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>. After that, your organization will be suspended until a subscription is activated.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${contactUrl}"
             style="background: #d97706; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            View Subscription Options
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">Need help or have questions? <a href="https://jitalsolution.com/contact" style="color: #008080;">Contact our support team</a>.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `⚠️ Your JanUmang trial expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
    html,
  });
};

// ── Template: Subscription Expired ────────────────────────────────────────────
const sendSubscriptionExpiredEmail = async ({ to, name, orgName }) => {
  const contactUrl = "https://jitalsolution.com/contact";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #dc2626; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">JanUmang</h1>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #dc2626; margin-top: 0;">🔴 Your Subscription Has Expired</h2>
        <p style="color: #555;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555;">The subscription for <strong>${orgName}</strong> has expired and the organization has been <strong>suspended</strong>. Users will not be able to log in until the subscription is renewed.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${contactUrl}"
             style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Contact Support to Renew
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `🔴 ${orgName} subscription has expired`,
    html,
  });
};

// ── Template: Admin-Initiated Password Reset ───────────────────────────────────
const sendAdminPasswordResetEmail = async ({
  to,
  name,
  temporaryPassword,
  adminName,
}) => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
      <div style="background: #008080; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">JanUmang</h1>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #333; margin-top: 0;">Your Password Has Been Reset</h2>
        <p style="color: #555;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555;">An administrator (<strong>${adminName}</strong>) has reset your password. Use the temporary password below to log in and you will be prompted to set a new password immediately.</p>
        <div style="background: #f4f4f4; border: 1px dashed #ccc; border-radius: 6px; padding: 16px; margin: 24px 0; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Temporary Password</p>
          <p style="margin: 8px 0 0; font-size: 22px; font-weight: bold; color: #008080; letter-spacing: 2px; font-family: monospace;">${temporaryPassword}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}"
             style="background: #008080; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Log In Now
          </a>
        </div>
        <p style="color: #888; font-size: 14px;">If you did not expect this, please contact your administrator immediately.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Your JanUmang Password Has Been Reset",
    html,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendTrialExpiryWarning,
  sendSubscriptionExpiredEmail,
  sendAdminPasswordResetEmail,
};
