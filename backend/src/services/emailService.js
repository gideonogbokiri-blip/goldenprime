const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || (EMAIL_USER ? `GoldenPrime <${EMAIL_USER}>` : 'GoldenPrime <noreply@goldenprime.com>');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('[emailService] EMAIL_USER / EMAIL_PASS not configured — emails will not send.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const tr = getTransporter();
  if (!tr) return { skipped: true };

  try {
    await tr.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      replyTo: EMAIL_USER,
      headers: {
        'X-Entity-Ref-ID': `gp-${Date.now()}`,
        'List-Unsubscribe': `<mailto:${EMAIL_USER}?subject=unsubscribe>`,
        MessageId: `<gp-${Date.now()}@goldenprime.vercel.app>`,
      },
    });
    return { ok: true };
  } catch (err) {
    console.error('[emailService] Failed to send email:', err.message);
    throw err;
  }
}

function layout(html) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0a0a; padding:32px; border-radius:12px;">
      <h2 style="color: #D4AF37; margin-top:0;">GoldenPrime</h2>
      ${html}
      <p style="color: #666; font-size: 12px; margin-top: 32px;">&copy; ${new Date().getFullYear()} GoldenPrime. All rights reserved.</p>
    </div>
  `;
}

function verifyButton(url) {
  return `
    <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
    <a href="${url}" style="background-color: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: bold;">Verify Email</a>
    <p style="color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
  `;
}

async function sendVerificationEmail(email, token) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'GoldenPrime - Verify Your Email',
    html: layout(verifyButton(verifyUrl)),
  });
}

async function sendResetPasswordEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: 'GoldenPrime - Reset Your Password',
    html: layout(`
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="background-color: #D4AF37; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0; font-weight: bold;">Reset Password</a>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    `),
  });
}

async function sendDepositApprovedEmail(email, amount) {
  return sendEmail({
    to: email,
    subject: 'GoldenPrime - Deposit Approved',
    html: layout(`
      <p>Good news! Your deposit of <strong>$${amount}</strong> has been approved and credited to your wallet.</p>
    `),
  });
}

async function sendWithdrawalStatusEmail(email, { amount, status, reason }) {
  const text = status === 'approved'
    ? `Your withdrawal request of <strong>$${amount}</strong> has been approved. Funds will be transferred to your bank shortly.`
    : `Your withdrawal request of <strong>$${amount}</strong> was rejected. ${reason ? `Reason: ${reason}. ` : ''}The amount has been returned to your wallet.`;
  return sendEmail({
    to: email,
    subject: `GoldenPrime - Withdrawal ${status}`,
    html: layout(`<p>${text}</p>`),
  });
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendDepositApprovedEmail, sendWithdrawalStatusEmail };
