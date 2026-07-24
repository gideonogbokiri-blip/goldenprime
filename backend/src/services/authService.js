const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../services/emailService');

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

  const { generateReferralCode, creditReferrer } = require('../models/Referral');
  const myRefCode = generateReferralCode(user.id);

  let referredBy = null;
  if (referralCode) {
    const referrerSetting = await UserSettings.getByReferralCode(referralCode);
    if (referrerSetting && referrerSetting.user_id !== user.id) {
      referredBy = referrerSetting.user_id;
    }
  }

  await UserSettings.upsert(user.id, {
    referral_code: myRefCode,
    referred_by: referredBy,
  });

  if (referredBy) {
    try {
      await creditReferrer(referredBy);
    } catch (err) {
      console.error('Failed to credit referrer:', err.message);
    }
  }

  const verificationToken = await User.setVerificationToken(user.id);

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user: { ...user, referralCode: myRefCode }, accessToken, refreshToken };
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

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { password_hash, verification_token, reset_token, reset_token_expires, ...userSafe } = user;
  return { user: userSafe, accessToken, refreshToken };
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

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };
