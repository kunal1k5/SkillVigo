import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sanitizeUser } from '../utils/auth.js';

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized. Missing bearer token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Not authorized. User no longer exists.' });
    }

    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized. Token is invalid or expired.' });
  }
}
