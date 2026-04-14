import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  getPendingVerificationChannels,
  isUserFullyVerified,
} from '../utils/verification.js';
import { sanitizeUser } from '../utils/auth.js';

async function loadAuthenticatedUserFromHeader(authHeader = '', { allowUnverified = false } = {}) {
  if (!authHeader.startsWith('Bearer ') || !process.env.JWT_SECRET) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select('-password');

  if (!user) {
    return null;
  }

  if (!allowUnverified && !isUserFullyVerified(user)) {
    return null;
  }

  return user;
}

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is missing.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured.',
      });
    }

    const user = await loadAuthenticatedUserFromHeader(authHeader, {
      allowUnverified: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access.',
      });
    }

    if (!isUserFullyVerified(user)) {
      return res.status(403).json({
        success: false,
        message: 'Verify your email and phone OTP before accessing protected resources.',
        verificationRequired: true,
        pendingChannels: getPendingVerificationChannels(user),
        user: sanitizeUser(user),
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error?.name === 'TokenExpiredError' || error?.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    if (error?.message === 'JWT_SECRET is not configured.') {
      return res.status(500).json({
        success: false,
        message: 'JWT_SECRET is not configured.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (authHeader.startsWith('Bearer ') && process.env.JWT_SECRET) {
      const user = await loadAuthenticatedUserFromHeader(authHeader);

      if (user) {
        req.user = user;
      }
    }

    return next();
  } catch {
    return next();
  }
};
