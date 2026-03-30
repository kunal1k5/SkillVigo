import { readDatabase, updateDatabase } from '../data/dataStore.js';
import User from '../models/User.js';
import { sanitizeUser } from '../utils/auth.js';
import {
  buildLocationLabel,
  normalizeLocationFields,
} from '../utils/location.js';

function resolveTargetUserId(req) {
  if (!req.params.id || req.params.id === 'me') {
    return req.user?.id;
  }

  return req.params.id;
}

function normalizeWebsite(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

function normalizeAvatarUrl(value) {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(trimmedValue)) {
    throw Object.assign(new Error('Profile photo must be a PNG, JPG, or WebP image.'), {
      status: 400,
    });
  }

  return trimmedValue;
}

async function syncLegacyProfileData(user) {
  await updateDatabase((currentDatabase) => {
    currentDatabase.currentUser = {
      id: user._id.toString(),
      name: user.name,
      area: user.location || '',
    };

    currentDatabase.skills = currentDatabase.skills.map((skill) =>
      skill.instructorId === user._id.toString()
        ? {
            ...skill,
            instructorName: user.name,
            area: user.location || skill.area,
          }
        : skill,
    );

    return currentDatabase;
  });
}

export async function getUserProfile(req, res, next) {
  try {
    const targetUserId = resolveTargetUserId(req);
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await syncLegacyProfileData(user);

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    const targetUserId = resolveTargetUserId(req);

    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this profile.' });
    }

    const currentUser = await User.findById(targetUserId);

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const allowedFields = [
      'name',
      'phone',
      'location',
      'country',
      'state',
      'city',
      'fullAddress',
      'bio',
      'website',
      'avatarUrl',
    ];
    const locationFieldNames = ['country', 'state', 'city', 'fullAddress'];
    const nextLocationFields = normalizeLocationFields(currentUser);
    const updates = {};
    let shouldRebuildLocation = false;

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        updates[field] =
          field === 'website'
            ? normalizeWebsite(req.body[field])
            : field === 'avatarUrl'
              ? normalizeAvatarUrl(req.body[field])
              : String(req.body[field]).trim();

        if (locationFieldNames.includes(field)) {
          nextLocationFields[field] = updates[field];
          shouldRebuildLocation = true;
        }
      }
    }

    if (shouldRebuildLocation) {
      updates.location = buildLocationLabel(nextLocationFields);
    }

    const user = await User.findByIdAndUpdate(targetUserId, updates, {
      new: true,
      runValidators: true,
    });

    await syncLegacyProfileData(user);

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function getUserSkills(req, res, next) {
  try {
    const database = await readDatabase();
    const targetUserId = resolveTargetUserId(req);
    const skills = database.skills.filter((skill) => skill.instructorId === targetUserId);

    return res.json(skills);
  } catch (error) {
    return next(error);
  }
}

export async function getUserReviews(req, res, next) {
  try {
    const database = await readDatabase();
    const targetUserId = resolveTargetUserId(req);
    const reviews = (database.reviews || []).filter((review) => review.revieweeId === targetUserId);

    return res.json(reviews);
  } catch (error) {
    return next(error);
  }
}
