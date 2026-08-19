const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const Wallet = require('../models/Wallet');

const SALT_ROUNDS = 12;

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role || 'user' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

async function register({ email, password, firstName, lastName, referralCode }) {
  const existing = await User.findByEmail(email);
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash, firstName, lastName });

  // Post-creation steps: best-effort, never fail registration
  const { generateReferralCode, creditReferrer } = require('../models/Referral');
  let myRefCode;
  try {
    myRefCode = generateReferralCode(user.id);
  } catch {
    myRefCode = `GP-${user.id.slice(0, 8).toUpperCase()}`;
  }

  let referredBy = null;
  if (referralCode) {
    try {
      const referrerSetting = await UserSettings.getByReferralCode(referralCode);
      if (referrerSetting && referrerSetting.user_id !== user.id) {
        referredBy = referrerSetting.user_id;
      }
    } catch (err) {
      console.error('Failed to look up referral code:', err.message);
    }
  }

  try {
    await UserSettings.upsert(user.id, {
      referral_code: myRefCode,
      referred_by: referredBy,
    });
  } catch (err) {
    console.error('Failed to create user settings:', err.message);
  }

  if (referredBy) {
    try {
      const { creditReferrer } = require('../models/Referral');
      await creditReferrer(referredBy);
    } catch (err) {
      console.error('Failed to credit referrer:', err.message);
    }
  }

  // Create default wallet
  try {
    await Wallet.getOrCreate(user.id, 'USD');
  } catch (err) {
    console.error('Failed to create default wallet:', err.message);
  }

  // Set verification token (best-effort)
  let verificationToken = null;
  try {
    verificationToken = await User.setVerificationToken(user.id);
  } catch (err) {
    console.error('Failed to set verification token:', err.message);
  }

  // Send verification email (best-effort, non-blocking)
  if (verificationToken) {
    try {
      const { sendVerificationEmail } = require('../services/emailService');
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.error('Failed to send verification email:', err.message);
    }
  }

  return { user: { ...user, referralCode: myRefCode } };
}

async function login({ email, password }) {
  const user = await User.findByEmail(email);
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { status: 401 });
  }

  if (!user.is_verified) {
    throw Object.assign(new Error('Please verify your email before logging in.'), {
      status: 403,
      needsVerification: true,
      email,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { password_hash, verification_token, reset_token, reset_token_expires, ...userSafe } = user;
  return { user: userSafe, accessToken, refreshToken };
}

async function resendVerification(email) {
  const user = await User.findByEmail(email);
  if (!user) {
    return { message: 'If an account exists, a verification email has been sent.' };
  }
  if (user.is_verified) {
    return { message: 'This email is already verified. You can log in.' };
  }

  const token = await User.setVerificationToken(user.id);
  if (token) {
    try {
      const { sendVerificationEmail } = require('../services/emailService');
      await sendVerificationEmail(email, token);
    } catch (err) {
      console.error('Failed to send verification email:', err.message);
      throw Object.assign(new Error('Could not send verification email. Please try again later.'), { status: 500 });
    }
  }

  return { message: 'Verification email sent. Please check your inbox.' };
}

async function verifyEmail(token) {
  const user = await User.verifyEmail(token);
  if (!user) {
    throw Object.assign(new Error('Invalid or expired verification token'), { status: 400 });
  }
  return user;
}

async function forgotPassword(email) {
  const user = await User.findByEmail(email);
  if (!user) {
    return { message: 'If an account exists, a reset email has been sent.' };
  }

  const reset = await User.setResetToken(email);
  if (reset) {
    try {
      const { sendResetPasswordEmail } = require('../services/emailService');
      await sendResetPasswordEmail(email, reset.token);
    } catch (err) {
      console.error('Failed to send reset email:', err.message);
    }
  }

  return { message: 'If an account exists, a reset email has been sent.' };
}

async function resetPassword(token, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const user = await User.resetPassword(token, passwordHash);
  if (!user) {
    throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 });
  }
  return user;
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  return user;
}

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe, resendVerification };
