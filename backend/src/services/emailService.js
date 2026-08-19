const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'GoldenPrime <onboarding@resend.dev>';

async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.error('[emailService] RESEND_API_KEY not configured — skipping email send.');
    return { skipped: true };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }

  return res.json();
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
