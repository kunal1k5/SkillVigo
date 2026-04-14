import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import {
  isEmailConfigured,
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
} from '../utils/email.js';
import { generateToken, sanitizeUser } from '../utils/auth.js';
import { isSmsConfigured, sendVerificationOtpSms } from '../utils/sms.js';
import { normalizeLocationCoordinates } from '../utils/location.js';
import {
  buildOtpExpiryDate,
  createOtpCode,
  getOtpResendRetrySeconds,
  getOtpTtlMinutes,
  getVerificationSummary,
  hashOtpCode,
  isEmailVerified,
  isOtpResendOnCooldown,
  isPhoneVerified,
  requiresPhoneVerification,
  isUserFullyVerified,
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  normalizePhone,
  normalizeString,
  shouldExposeOtpInResponse,
} from '../utils/verification.js';

const ALLOWED_ROLES = ['provider', 'seeker'];
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;
const VERIFICATION_CHANNELS = ['email', 'phone'];

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createPasswordResetToken = () => crypto.randomBytes(32).toString('hex');
const getClientUrl = () => normalizeString(process.env.CLIENT_URL) || 'http://localhost:5173';

function getVerificationMessage(user) {
  const pendingChannels = getVerificationSummary(user).pendingChannels;

  if (pendingChannels.length === 2) {
    return 'Verify the OTP sent to your email and phone before signing in.';
  }

  if (pendingChannels[0] === 'email') {
    return 'Verify the OTP sent to your email before signing in.';
  }

  if (pendingChannels[0] === 'phone') {
    return 'Verify the OTP sent to your phone before signing in.';
  }

  return 'Verification completed successfully.';
}

function buildVerificationPayload(user, devOtps = {}) {
  const summary = getVerificationSummary(user);
  const expiresInMinutes = getOtpTtlMinutes();

  return {
    email: {
      ...summary.email,
      ...(summary.email.required && !summary.email.verified ? { expiresInMinutes } : {}),
      ...(devOtps.email ? { devOtp: devOtps.email } : {}),
    },
    phone: {
      ...summary.phone,
      ...(summary.phone.required && !summary.phone.verified ? { expiresInMinutes } : {}),
      ...(devOtps.phone ? { devOtp: devOtps.phone } : {}),
    },
    pendingChannels: summary.pendingChannels,
  };
}

function buildDuplicateAccountMessage(existingUser, email, phone) {
  if (existingUser?.email === email) {
    return 'A user with this email already exists.';
  }

  if (existingUser?.phone && existingUser.phone === phone) {
    return 'A user with this phone number already exists.';
  }

  return 'A user with these contact details already exists.';
}

function buildDuplicateKeyMessage(error) {
  if (error?.keyPattern?.phone || error?.keyValue?.phone) {
    return 'A user with this phone number already exists.';
  }

  return 'A user with this email already exists.';
}

function buildUserLookupQuery({ email, phone, identifier }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);
  const normalizedIdentifier = normalizeString(identifier);

  if (normalizedEmail) {
    return { email: normalizedEmail };
  }

  if (normalizedPhone) {
    return { phone: normalizedPhone };
  }

  if (!normalizedIdentifier) {
    return null;
  }

  if (normalizedIdentifier.includes('@')) {
    return { email: normalizeEmail(normalizedIdentifier) };
  }

  const normalizedIdentifierPhone = normalizePhone(normalizedIdentifier);
  return normalizedIdentifierPhone ? { phone: normalizedIdentifierPhone } : null;
}

function getChannelOtpFields(channel) {
  if (channel === 'email') {
    return {
      contactValue: 'email',
      verifiedField: 'emailVerified',
      otpHashField: 'emailOtpHash',
      otpExpiresField: 'emailOtpExpires',
      otpLastSentAtField: 'emailOtpLastSentAt',
    };
  }

  return {
    contactValue: 'phone',
    verifiedField: 'phoneVerified',
    otpHashField: 'phoneOtpHash',
    otpExpiresField: 'phoneOtpExpires',
    otpLastSentAtField: 'phoneOtpLastSentAt',
  };
}

function isChannelAlreadyVerified(user, channel) {
  return channel === 'email' ? isEmailVerified(user) : isPhoneVerified(user);
}

async function deliverVerificationOtp({ user, channel, otpCode }) {
  const expiresInMinutes = getOtpTtlMinutes();

  if (channel === 'email') {
    if (isEmailConfigured()) {
      await sendVerificationOtpEmail({
        to: user.email,
        name: user.name,
        otpCode,
        expiresInMinutes,
      });
      return;
    }

    if (shouldExposeOtpInResponse()) {
      return;
    }

    const error = new Error(
      'Email OTP delivery is not configured. Add SMTP settings in server/.env.',
    );
    error.status = 503;
    throw error;
  }

  if (isSmsConfigured()) {
    await sendVerificationOtpSms({
      to: user.phone,
      otpCode,
      expiresInMinutes,
    });
    return;
  }

  if (shouldExposeOtpInResponse()) {
    return;
  }

  const error = new Error(
    'Phone OTP delivery is not configured. Add Twilio SMS settings in server/.env.',
  );
  error.status = 503;
  throw error;
}

async function issueVerificationOtp(user, channel) {
  const otpCode = createOtpCode();
  await deliverVerificationOtp({ user, channel, otpCode });

  const {
    verifiedField,
    otpHashField,
    otpExpiresField,
    otpLastSentAtField,
  } = getChannelOtpFields(channel);

  user[verifiedField] = false;
  user[otpHashField] = hashOtpCode(otpCode);
  user[otpExpiresField] = buildOtpExpiryDate();
  user[otpLastSentAtField] = new Date();

  return shouldExposeOtpInResponse() ? otpCode : undefined;
}

function clearVerificationOtp(user, channel) {
  const {
    verifiedField,
    otpHashField,
    otpExpiresField,
    otpLastSentAtField,
  } = getChannelOtpFields(channel);

  user[verifiedField] = true;
  user[otpHashField] = undefined;
  user[otpExpiresField] = undefined;
  user[otpLastSentAtField] = undefined;
}

function getOtpSelectFields() {
  return [
    '+password',
    '+emailOtpHash',
    '+emailOtpExpires',
    '+emailOtpLastSentAt',
    '+phoneOtpHash',
    '+phoneOtpExpires',
    '+phoneOtpLastSentAt',
    '+resetPasswordToken',
    '+resetPasswordExpires',
  ].join(' ');
}

export const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'seeker',
      phone = '',
      location = '',
    } = req.body || {};

    const normalizedName = normalizeString(name);
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = typeof password === 'string' ? password : '';
    const normalizedRole = normalizeString(role).toLowerCase() || 'seeker';
    const normalizedPhone = normalizePhone(phone);
    const normalizedLocation = normalizeString(location);
    const normalizedLocationCoordinates = normalizeLocationCoordinates(req.body || {});

    if (!normalizedName || !normalizedEmail || !normalizedPassword.trim() || !normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone number, and password are required.',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number with 10 to 15 digits.',
      });
    }

    if (normalizedPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either provider or seeker.',
      });
    }

    const shouldVerifyPhone = requiresPhoneVerification({ phone: normalizedPhone });

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: buildDuplicateAccountMessage(existingUser, normalizedEmail, normalizedPhone),
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);
    const user = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      phone: normalizedPhone,
      location: normalizedLocation,
      locationCoordinates: normalizedLocationCoordinates || undefined,
      emailVerified: false,
      phoneVerified: !shouldVerifyPhone,
    });

    const emailDevOtp = await issueVerificationOtp(user, 'email');
    const phoneDevOtp = shouldVerifyPhone ? await issueVerificationOtp(user, 'phone') : undefined;

    await user.save();

    return res.status(201).json({
      success: true,
      token: '',
      verificationRequired: true,
      message: `Account created. ${getVerificationMessage(user)}`,
      user: sanitizeUser(user),
      verification: buildVerificationPayload(user, {
        email: emailDevOtp,
        phone: phoneDevOtp,
      }),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: buildDuplicateKeyMessage(error),
      });
    }

    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const normalizedPassword = typeof req.body?.password === 'string' ? req.body.password : '';
    const lookupQuery = buildUserLookupQuery({
      email: req.body?.email,
      phone: req.body?.phone,
      identifier: req.body?.identifier,
    });

    if (!lookupQuery || !normalizedPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number and password are required.',
      });
    }

    const user = await User.findOne(lookupQuery).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const isPasswordValid = await bcrypt.compare(normalizedPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    if (!isUserFullyVerified(user)) {
      return res.status(403).json({
        success: false,
        token: '',
        verificationRequired: true,
        message: getVerificationMessage(user),
        user: sanitizeUser(user),
        verification: buildVerificationPayload(user),
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const getAuthenticatedUser = async (req, res) =>
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });

export const resendVerificationOtp = async (req, res, next) => {
  try {
    const channel = normalizeString(req.body?.channel).toLowerCase();

    if (!VERIFICATION_CHANNELS.includes(channel)) {
      return res.status(400).json({
        success: false,
        message: 'channel must be either email or phone.',
      });
    }

    const lookupQuery = buildUserLookupQuery({
      email: req.body?.email,
      phone: req.body?.phone,
      identifier: req.body?.identifier,
    });

    if (!lookupQuery) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required to resend an OTP.',
      });
    }

    const user = await User.findOne(lookupQuery).select(getOtpSelectFields());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account was found for the provided contact details.',
      });
    }

    const {
      contactValue,
      otpLastSentAtField,
    } = getChannelOtpFields(channel);

    if (!user[contactValue]) {
      return res.status(400).json({
        success: false,
        message: `This account does not have a ${channel} available for verification.`,
      });
    }

    if (isChannelAlreadyVerified(user, channel)) {
      return res.status(400).json({
        success: false,
        message: `This ${channel} is already verified.`,
      });
    }

    if (isOtpResendOnCooldown(user[otpLastSentAtField])) {
      const retryAfterSeconds = getOtpResendRetrySeconds(user[otpLastSentAtField]);
      return res.status(429).json({
        success: false,
        message: `Please wait ${retryAfterSeconds} seconds before requesting another OTP.`,
        retryAfterSeconds,
      });
    }

    const devOtp = await issueVerificationOtp(user, channel);
    await user.save();

    return res.status(200).json({
      success: true,
      verificationRequired: true,
      message: `A fresh ${channel} OTP has been sent.`,
      user: sanitizeUser(user),
      verification: buildVerificationPayload(user, {
        [channel]: devOtp,
      }),
    });
  } catch (error) {
    return next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const channel = normalizeString(req.body?.channel).toLowerCase();
    const otp = normalizeString(req.body?.otp);

    if (!VERIFICATION_CHANNELS.includes(channel)) {
      return res.status(400).json({
        success: false,
        message: 'channel must be either email or phone.',
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a valid 6-digit code.',
      });
    }

    const lookupQuery = buildUserLookupQuery({
      email: req.body?.email,
      phone: req.body?.phone,
      identifier: req.body?.identifier,
    });

    if (!lookupQuery) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required to verify an OTP.',
      });
    }

    const user = await User.findOne(lookupQuery).select(getOtpSelectFields());

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is invalid or the account could not be found.',
      });
    }

    if (isChannelAlreadyVerified(user, channel)) {
      return res.status(200).json({
        success: true,
        token: '',
        message: `This ${channel} is already verified.`,
        user: sanitizeUser(user),
        verificationRequired: !isUserFullyVerified(user),
        verification: buildVerificationPayload(user),
      });
    }

    const {
      otpHashField,
      otpExpiresField,
    } = getChannelOtpFields(channel);

    const otpHash = user[otpHashField];
    const otpExpires = user[otpExpiresField];

    if (!otpHash || !otpExpires || new Date(otpExpires) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This OTP is invalid or has expired. Request a fresh OTP and try again.',
      });
    }

    if (otpHash !== hashOtpCode(otp)) {
      return res.status(400).json({
        success: false,
        message: 'This OTP is invalid or has expired. Request a fresh OTP and try again.',
      });
    }

    clearVerificationOtp(user, channel);
    await user.save();

    const verificationComplete = isUserFullyVerified(user);

    return res.status(200).json({
      success: true,
      token: verificationComplete ? generateToken(user._id.toString()) : '',
      message: verificationComplete
        ? 'Verification completed successfully. You can now sign in.'
        : 'OTP verified successfully. Complete the remaining verification step to finish setup.',
      user: sanitizeUser(user),
      verificationRequired: !verificationComplete,
      verification: buildVerificationPayload(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeEmail(req.body?.email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const responsePayload = {
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.',
    };

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json(responsePayload);
    }

    const resetToken = createPasswordResetToken();
    const resetTokenHash = hashResetToken(resetToken);
    const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await User.updateOne(
      { _id: user._id },
      {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires,
      },
    );

    const resetUrl = `${getClientUrl().replace(/\/$/, '')}/reset-password/${resetToken}`;
    const expiresInMinutes = Math.round(RESET_TOKEN_TTL_MS / 60000);

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
        expiresInMinutes,
      });
    } catch (emailError) {
      await User.updateOne(
        { _id: user._id },
        {
          $unset: {
            resetPasswordToken: 1,
            resetPasswordExpires: 1,
          },
        },
      );

      emailError.status = emailError.status || 500;
      emailError.message =
        emailError.message || 'Could not send the password reset email right now.';
      throw emailError;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = normalizeString(req.params?.token);
    const normalizedPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required.',
      });
    }

    if (normalizedPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: hashResetToken(resetToken),
      resetPasswordExpires: { $gt: new Date() },
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired.',
      });
    }

    user.password = await bcrypt.hash(normalizedPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    return next(error);
  }
};
