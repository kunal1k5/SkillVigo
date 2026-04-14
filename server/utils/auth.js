import jwt from 'jsonwebtoken';
import {
  getVerificationSummary,
  isEmailVerified,
  isPhoneVerified,
  isUserFullyVerified,
} from './verification.js';

export function generateToken(userId) {
  const { JWT_SECRET } = process.env;

  if (!JWT_SECRET) {
    throw Object.assign(new Error('JWT_SECRET is required to sign auth tokens'), {
      status: 500,
    });
  }

  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    emailVerified: isEmailVerified(user),
    phoneVerified: isPhoneVerified(user),
    isVerified: isUserFullyVerified(user),
    verification: getVerificationSummary(user),
    location: user.location || '',
    locationCoordinates:
      user.locationCoordinates?.latitude !== undefined &&
      user.locationCoordinates?.longitude !== undefined
        ? {
            latitude: Number(user.locationCoordinates.latitude),
            longitude: Number(user.locationCoordinates.longitude),
          }
        : null,
    country: user.country || '',
    state: user.state || '',
    city: user.city || '',
    fullAddress: user.fullAddress || '',
    bio: user.bio || '',
    website: user.website || '',
    avatarUrl: user.avatarUrl || '',
    createdAt: user.createdAt,
  };
}
