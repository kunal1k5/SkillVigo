import jwt from 'jsonwebtoken';

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
    location: user.location || '',
    country: user.country || '',
    state: user.state || '',
    city: user.city || '',
    fullAddress: user.fullAddress || '',
    bio: user.bio || '',
    website: user.website || '',
    createdAt: user.createdAt,
  };
}
