import mongoose from 'mongoose';
import { readDatabase, updateDatabase } from '../data/dataStore.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Skill from '../models/Skill.js';
import { sanitizeUser } from '../utils/auth.js';
import {
  buildLocationLabel,
  normalizeLocationFields,
} from '../utils/location.js';
import {
  isValidPhone,
  normalizePhone,
} from '../utils/verification.js';

function resolveTargetUserId(req) {
  if (!req.params.id || req.params.id === 'me') {
    return req.user?.id;
  }

  return req.params.id;
}

function isValidUserId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function buildProfileSkill(skill) {
  return {
    id: skill._id.toString(),
    title: skill.title,
    category: skill.category,
    description: skill.description,
    price: skill.price,
    experience: skill.experience,
    location: skill.location,
    createdAt: skill.createdAt,
  };
}

function buildProfileReview(review, skillsById) {
  const relatedSkill = skillsById.get(review.skillId);

  return {
    id: review.id,
    skillId: review.skillId,
    skillTitle: relatedSkill?.title || review.skillTitle || 'Skill session',
    reviewer: review.reviewerName || 'SkillVigo member',
    reviewerId: review.reviewerId || '',
    rating: Number(review.rating || 0),
    comment: review.comment || '',
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function normalizeObjectIdString(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === 'object') {
    if ('_id' in value && value._id) {
      return normalizeObjectIdString(value._id);
    }

    if ('id' in value && value.id) {
      return String(value.id);
    }
  }

  return String(value);
}

function buildProfileStats({ user, skills, bookings, reviews }) {
  const isProvider = user.role === 'provider';
  const userId = user._id.toString();

  if (isProvider) {
    const providerBookings = bookings.filter(
      (booking) => normalizeObjectIdString(booking.instructorId) === userId,
    );
    const activeClients = new Set(
      providerBookings
        .filter((booking) => ['pending', 'confirmed', 'completed'].includes(booking.status))
        .map((booking) => normalizeObjectIdString(booking.studentId))
        .filter(Boolean),
    ).size;

    return {
      totalBookings: providerBookings.length,
      totalSkills: skills.length,
      activeClients,
      bookingCount: providerBookings.length,
    };
  }

  const seekerBookings = bookings.filter(
    (booking) => normalizeObjectIdString(booking.studentId) === userId,
  );

  return {
    totalBookings: seekerBookings.length,
    totalSkills: skills.length,
    activeClients: 0,
    bookingCount: seekerBookings.length,
  };
}

async function buildProfilePayload(user) {
  const [database, mongoSkills, mongoBookings] = await Promise.all([
    readDatabase(),
    Skill.find({ userId: user._id }).sort({ createdAt: -1 }),
    Booking.find({
      $or: [{ studentId: user._id }, { instructorId: user._id }],
    }).select('studentId instructorId status'),
  ]);

  const skills = mongoSkills.map(buildProfileSkill);
  const skillsById = new Map(
    [
      ...(database.skills || []).map((skill) => [skill.id, skill]),
      ...skills.map((skill) => [skill.id, skill]),
    ],
  );
  const reviews = (database.reviews || [])
    .filter((review) => review.revieweeId === user._id.toString())
    .map((review) => buildProfileReview(review, skillsById))
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const averageRating = reviews.length ? Number((totalRating / reviews.length).toFixed(1)) : 0;
  const stats = buildProfileStats({
    user,
    skills,
    bookings: mongoBookings,
    reviews,
  });

  return {
    ...sanitizeUser(user),
    skills,
    reviews,
    totalSkills: stats.totalSkills,
    totalBookings: stats.totalBookings,
    activeClients: stats.activeClients,
    bookingCount: stats.bookingCount,
    averageRating,
    rating: averageRating,
    reviewCount: reviews.length,
  };
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

    if (!targetUserId || !isValidUserId(targetUserId)) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await syncLegacyProfileData(user);

    return res.json({ user: await buildProfilePayload(user) });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserProfile(req, res, next) {
  try {
    const targetUserId = resolveTargetUserId(req);

    if (!targetUserId || !isValidUserId(targetUserId)) {
      return res.status(404).json({ error: 'User not found.' });
    }

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
        if (field === 'phone') {
          const normalizedPhone = normalizePhone(req.body[field]);

          if (normalizedPhone && !isValidPhone(normalizedPhone)) {
            return res.status(400).json({
              error: 'Phone number must contain 10 to 15 digits.',
            });
          }

          if (normalizedPhone && normalizedPhone !== currentUser.phone) {
            const duplicatePhoneUser = await User.findOne({
              _id: { $ne: targetUserId },
              phone: normalizedPhone,
            });

            if (duplicatePhoneUser) {
              return res.status(409).json({
                error: 'A user with this phone number already exists.',
              });
            }
          }

          updates.phone = normalizedPhone;
          continue;
        }

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

    return res.json({ user: await buildProfilePayload(user) });
  } catch (error) {
    return next(error);
  }
}

export async function getUserSkills(req, res, next) {
  try {
    const targetUserId = resolveTargetUserId(req);

    if (!targetUserId || !isValidUserId(targetUserId)) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const skills = await Skill.find({ userId: targetUserId }).sort({ createdAt: -1 });

    return res.json(skills.map(buildProfileSkill));
  } catch (error) {
    return next(error);
  }
}

export async function getUserReviews(req, res, next) {
  try {
    const database = await readDatabase();
    const targetUserId = resolveTargetUserId(req);

    if (!targetUserId || !isValidUserId(targetUserId)) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const skillsById = new Map((database.skills || []).map((skill) => [skill.id, skill]));
    const reviews = (database.reviews || [])
      .filter((review) => review.revieweeId === targetUserId)
      .map((review) => buildProfileReview(review, skillsById))
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    return res.json(reviews);
  } catch (error) {
    return next(error);
  }
}
