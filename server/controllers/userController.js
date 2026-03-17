import { readDatabase, updateDatabase } from '../data/dataStore.js';
import User from '../models/User.js';
import { sanitizeUser } from '../utils/auth.js';

function resolveTargetUserId(req) {
  if (!req.params.id || req.params.id === 'me') {
    return req.user?.id;
  }

  return req.params.id;
}

export async function getUserProfile(req, res, next) {
  try {
    const targetUserId = resolveTargetUserId(req);
    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

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

    const allowedFields = ['name', 'phone', 'location'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        updates[field] = String(req.body[field]).trim();
      }
    }

    const user = await User.findByIdAndUpdate(targetUserId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

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
