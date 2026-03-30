import User from '../models/User.js';
import { generateToken, sanitizeUser } from '../utils/auth.js';
import {
  hasCompleteLocationFields,
  normalizeLocationFields,
} from '../utils/location.js';

const PUBLIC_ROLES = ['provider', 'seeker'];

function buildAuthResponse(user) {
  return {
    token: generateToken(user._id.toString()),
    user: sanitizeUser(user),
  };
}

export async function registerUser(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role = 'seeker',
      phone = '',
    } = req.body || {};
    const locationFields = normalizeLocationFields(req.body || {});

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }

    if (!hasCompleteLocationFields(locationFields)) {
      return res.status(400).json({
        error: 'country, state, city, and fullAddress are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (!PUBLIC_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Role must be either provider or seeker.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      phone: phone.trim(),
      ...locationFields,
    });

    return res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.json(buildAuthResponse(user));
  } catch (error) {
    return next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}
