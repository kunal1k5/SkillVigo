import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const ALLOWED_ROLES = ['provider', 'seeker'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;
const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const buildUserResponse = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  location: user.location || '',
  createdAt: user.createdAt,
});

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET is not configured');
    error.status = 500;
    throw error;
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createPasswordResetToken = () => crypto.randomBytes(32).toString('hex');

const getClientUrl = () => normalizeString(process.env.CLIENT_URL) || 'http://localhost:5173';

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
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedPassword = typeof password === 'string' ? password : '';
    const normalizedRole = normalizeString(role).toLowerCase() || 'seeker';
    const normalizedPhone = normalizeString(phone);
    const normalizedLocation = normalizeString(location);

    if (!normalizedName || !normalizedEmail || !normalizedPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
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

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      phone: normalizedPhone,
      location: normalizedLocation,
    });
    const token = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    return next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !normalizedPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(normalizedPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const normalizedEmail = normalizeString(req.body?.email).toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
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
