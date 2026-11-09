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

async function sendEmail({ to, subject, html, text }) {
  const tr = getTransporter();
  if (!tr) return { skipped: true };

  try {
    await tr.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
      replyTo: EMAIL_USER,
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendAdminEmail(email, subject, body) {
  const safeBody = escapeHtml(body).replace(/\r?\n/g, '<br/>');
  const html = `
    <div style="margin:0;padding:32px 12px;background:#090909;font-family:Arial,Helvetica,sans-serif;color:#f4f4f5;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;border-collapse:collapse;background:#111113;border:1px solid #29292d;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:24px 30px;border-bottom:1px solid #29292d;">
            <div style="font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#f4f4f5;">
              <span style="display:inline-block;width:30px;height:30px;line-height:30px;margin-right:9px;border-radius:50%;text-align:center;vertical-align:middle;background:#d4af37;color:#111113;font-size:12px;font-weight:800;">GP</span>
              <span style="vertical-align:middle;">Golden<span style="color:#d4af37;">Prime</span></span>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:30px;font-size:16px;line-height:1.75;color:#e4e4e7;word-break:break-word;">${safeBody}</td>
        </tr>
        <tr>
          <td style="padding:18px 30px;border-top:1px solid #29292d;color:#71717a;font-size:12px;line-height:1.5;">
            GoldenPrime · Account communication
          </td>
        </tr>
      </table>
    </div>`;
  const result = await sendEmail({
    to: email,
    subject,
    html,
    text: body,
  });
  if (result.skipped) {
    throw Object.assign(new Error('Email delivery is not configured on the server.'), { code: 'EMAIL_NOT_CONFIGURED' });
  }
  return result;
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendDepositApprovedEmail, sendWithdrawalStatusEmail, sendAdminEmail };
