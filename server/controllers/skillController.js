import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import { readDatabase } from '../data/dataStore.js';
import {
  getDistanceBetweenCoordinates,
  normalizeLocationCoordinates,
} from '../utils/location.js';

const DEFAULT_CURRENCY = 'INR';
const DEFAULT_SESSION_DURATION = 60;
const DEFAULT_NEARBY_DISTANCE_KM = 10;
const ACCENT_PALETTE = [
  'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
  'linear-gradient(135deg, #065f46 0%, #22c55e 100%)',
  'linear-gradient(135deg, #7c2d12 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #312e81 0%, #2563eb 100%)',
  'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
  'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
];

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

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

function parseBooleanQuery(value, fallbackValue = false) {
  if (value === undefined) {
    return fallbackValue;
  }

  return String(value).trim().toLowerCase() === 'true';
}

function parsePositiveIntegerQuery(value, fallbackValue = 0) {
  const parsedValue = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
}

function parseRadiusKm(value) {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)\s*km/i);
  return match ? Number(match[1]) : null;
}

function createStableNumberFromString(value = '') {
  return String(value)
    .split('')
    .reduce((total, character, index) => total + character.charCodeAt(0) * (index + 1), 0);
}

function getModeGroup(modeValue = '') {
  const normalizedMode = `${modeValue}`.toLowerCase();

  if (normalizedMode.includes('hybrid')) {
    return 'hybrid';
  }

  if (normalizedMode.includes('online')) {
    return 'online';
  }

  return 'offline';
}

function normalizeModeFilter(modeValue = '') {
  const normalizedMode = normalizeString(modeValue).toLowerCase();

  if (!normalizedMode) {
    return '';
  }

  if (normalizedMode === 'local') {
    return 'offline';
  }

  return normalizedMode;
}

function isOnlineOnlyMode(modeValue = '') {
  const normalizedMode = `${modeValue || ''}`.toLowerCase();
  return getModeGroup(normalizedMode) === 'online' && !normalizedMode.includes('hybrid');
}

function resolveSkillCoordinates(skill = {}) {
  const skillCoordinates = normalizeLocationCoordinates({
    locationCoordinates: skill.locationCoordinates,
  });

  if (skillCoordinates) {
    return skillCoordinates;
  }

  if (skill.userId && typeof skill.userId === 'object') {
    return normalizeLocationCoordinates({
      locationCoordinates: skill.userId.locationCoordinates,
    });
  }

  return null;
}

function resolveViewerCoordinates(req) {
  const coordinatesFromQuery = normalizeLocationCoordinates(req.query || {});

  if (coordinatesFromQuery) {
    return coordinatesFromQuery;
  }

  return normalizeLocationCoordinates({
    locationCoordinates: req.user?.locationCoordinates,
  });
}

function resolveSkillCoordinatesFromRequest(req) {
  const coordinatesFromPayload = normalizeLocationCoordinates(req.body || {});

  if (coordinatesFromPayload) {
    return coordinatesFromPayload;
  }

  return normalizeLocationCoordinates({
    locationCoordinates: req.user?.locationCoordinates,
  });
}

function pickAccent(skill) {
  const stableValue = createStableNumberFromString(
    `${skill.category || ''}:${skill.title || ''}:${normalizeObjectIdString(skill._id)}`,
  );
  return ACCENT_PALETTE[stableValue % ACCENT_PALETTE.length];
}

function buildDefaultResponseTime(skill) {
  if (normalizeString(skill.responseTime)) {
    return skill.responseTime;
  }

  const baseMinutes =
    7 +
    (createStableNumberFromString(
      `${skill.title || ''}:${skill.location || ''}:${skill.experience || 0}`,
    ) %
      18);

  if (baseMinutes <= 20) {
    return `Usually replies in ${baseMinutes} min`;
  }

  return 'Usually replies within the day';
}

function buildDefaultOutcomes(skill) {
  if (Array.isArray(skill.outcomes) && skill.outcomes.length) {
    return skill.outcomes
      .map((item) => normalizeString(item))
      .filter(Boolean)
      .slice(0, 3);
  }

  const primaryTag = Array.isArray(skill.tags) && skill.tags.length ? skill.tags[0] : '';
  const locationLabel = normalizeString(skill.location) || 'your area';

  return [
    `Get a focused ${skill.title} session tailored to your goals.`,
    primaryTag
      ? `Practice with hands-on ${primaryTag.toLowerCase()} guidance you can apply quickly.`
      : 'Leave with practical next steps you can use right away.',
    `${skill.mode || 'Flexible delivery'} support available around ${locationLabel}.`,
  ];
}

function buildAvailability(skill, metrics) {
  if (normalizeString(skill.availability)) {
    return skill.availability;
  }

  if ((metrics.activeBookings || 0) > 0) {
    return `${metrics.activeBookings} active request${metrics.activeBookings === 1 ? '' : 's'}`;
  }

  return 'Schedule on request';
}

function buildDistanceKm(skill, viewerCoordinates) {
  if (isOnlineOnlyMode(skill.mode)) {
    return null;
  }

  if (!viewerCoordinates) {
    return null;
  }

  const skillCoordinates = resolveSkillCoordinates(skill);

  if (!skillCoordinates) {
    return null;
  }

  const distanceKm = getDistanceBetweenCoordinates(viewerCoordinates, skillCoordinates);

  if (!Number.isFinite(distanceKm)) {
    return null;
  }

  return Number(distanceKm.toFixed(1));
}

function buildDistanceLabel(distanceKm, modeGroup) {
  if (typeof distanceKm === 'number') {
    return `${distanceKm.toFixed(1)} km away`;
  }

  return modeGroup === 'online' ? 'Remote friendly' : 'Distance unavailable';
}

function buildProviderPayload(skill) {
  if (skill.userId && typeof skill.userId === 'object' && 'name' in skill.userId) {
    return {
      id: skill.userId._id?.toString() || skill.userId.id,
      name: skill.userId.name,
      role: skill.userId.role || 'provider',
      location: skill.userId.location || '',
      locationCoordinates: normalizeLocationCoordinates({
        locationCoordinates: skill.userId.locationCoordinates,
      }),
      avatarUrl: skill.userId.avatarUrl || '',
    };
  }

  if (skill.userId) {
    return {
      id: normalizeObjectIdString(skill.userId),
      role: 'provider',
    };
  }

  return null;
}

function buildFallbackRating(skill, metrics) {
  const experience = Number(skill.experience || 0);
  const activeBookings = Number(metrics.activeBookings || 0);
  const learnersHelped = Number(metrics.learnersHelped || 0);
  const generatedRating = 4.2 + Math.min(0.5, experience * 0.06) + Math.min(0.2, activeBookings * 0.03) + Math.min(0.1, learnersHelped * 0.01);
  return Number(Math.min(5, generatedRating).toFixed(1));
}

function buildSkillResponse(skill, options = {}) {
  const {
    currentUser = null,
    viewerCoordinates = null,
    metrics = {},
  } = options;

  const provider = buildProviderPayload(skill);
  const skillId = normalizeObjectIdString(skill._id);
  const viewerId = normalizeObjectIdString(currentUser?._id || currentUser?.id);
  const isOwnListing = Boolean(viewerId && provider?.id && viewerId === provider.id);
  const modeGroup = getModeGroup(skill.mode);
  const rating =
    metrics.reviewCount > 0
      ? Number(Number(metrics.rating || 0).toFixed(1))
      : buildFallbackRating(skill, metrics);
  const distanceKm = buildDistanceKm(skill, viewerCoordinates);
  const distanceLabel = buildDistanceLabel(distanceKm, modeGroup);
  const viewerRole = currentUser?.role || 'guest';
  const canHire = viewerRole !== 'provider' && !isOwnListing;
  const serviceRadiusKm = parseRadiusKm(skill.serviceRadius);

  return {
    id: skillId,
    title: skill.title,
    description: skill.description,
    category: skill.category,
    mode: skill.mode,
    modeGroup,
    level: skill.level,
    price: skill.price,
    currency: skill.currency || DEFAULT_CURRENCY,
    priceType: 'session',
    experience: skill.experience,
    duration: Number(metrics.averageDuration || skill.duration || DEFAULT_SESSION_DURATION),
    location: skill.location,
    area: skill.location,
    availability: buildAvailability(skill, metrics),
    serviceRadius: skill.serviceRadius,
    serviceRadiusKm,
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    outcomes: buildDefaultOutcomes(skill),
    createdAt: skill.createdAt,
    provider,
    providerName: provider?.name || 'SkillVigo Expert',
    instructorName: provider?.name || 'SkillVigo Expert',
    rating,
    reviewCount: Number(metrics.reviewCount || 0),
    learnersHelped: Number(metrics.learnersHelped || 0),
    responseTime: buildDefaultResponseTime(skill),
    distanceKm,
    distanceLabel,
    accent: pickAccent(skill),
    isOwnListing,
    canBook: canHire,
    canChat: canHire,
    searchVisibility:
      viewerRole === 'provider'
        ? 'provider-readonly'
        : viewerRole === 'seeker'
          ? 'seeker-booking'
          : 'guest-browse',
  };
}

function validateCreatePayload({ title, description, category, price, experience, location }) {
  if (!title || !description || !category || price === null || experience === null || !location) {
    return 'Title, description, category, price, experience, and location are required.';
  }

  if (price < 0) {
    return 'Price must be a non-negative number.';
  }

  if (experience < 0) {
    return 'Experience must be a non-negative number.';
  }

  return null;
}

function validateUpdatePayload({ title, description, category, price, experience, location }) {
  if (title !== undefined && !title) {
    return 'Title cannot be empty.';
  }

  if (description !== undefined && !description) {
    return 'Description cannot be empty.';
  }

  if (category !== undefined && !category) {
    return 'Category cannot be empty.';
  }

  if (location !== undefined && !location) {
    return 'Location cannot be empty.';
  }

  if (price !== undefined && (price === null || price < 0)) {
    return 'Price must be a non-negative number.';
  }

  if (experience !== undefined && (experience === null || experience < 0)) {
    return 'Experience must be a non-negative number.';
  }

  return null;
}

const buildPopulateOptions = () => ({
  path: 'userId',
  select: 'name location locationCoordinates avatarUrl role',
});

async function buildMetricsBySkill(skills = []) {
  const skillIds = skills
    .map((skill) => normalizeObjectIdString(skill._id))
    .filter(Boolean);

  if (!skillIds.length) {
    return new Map();
  }

  const [database, bookings] = await Promise.all([
    readDatabase(),
    Booking.find({ skillId: { $in: skillIds } }).select('skillId studentId status duration'),
  ]);

  const metricsBySkill = new Map();
  const reviews = Array.isArray(database?.reviews) ? database.reviews : [];

  skills.forEach((skill) => {
    const skillId = normalizeObjectIdString(skill._id);
    const relatedReviews = reviews.filter((review) => review.skillId === skillId);
    const relatedBookings = bookings.filter(
      (booking) => normalizeObjectIdString(booking.skillId) === skillId,
    );
    const completedLearners = new Set(
      relatedBookings
        .filter((booking) => String(booking.status || '').toLowerCase() === 'completed')
        .map((booking) => normalizeObjectIdString(booking.studentId))
        .filter(Boolean),
    );
    const activeBookings = relatedBookings.filter((booking) =>
      ['pending', 'confirmed'].includes(String(booking.status || '').toLowerCase()),
    ).length;
    const averageDurationMinutes = relatedBookings.length
      ? Math.round(
          relatedBookings.reduce((sum, booking) => {
            const parsedMinutes = Number.parseInt(String(booking.duration || ''), 10);
            return sum + (Number.isFinite(parsedMinutes) ? parsedMinutes : DEFAULT_SESSION_DURATION);
          }, 0) / relatedBookings.length,
        )
      : DEFAULT_SESSION_DURATION;
    const totalRating = relatedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);

    metricsBySkill.set(skillId, {
      activeBookings,
      averageDuration: averageDurationMinutes,
      learnersHelped: completedLearners.size,
      rating: relatedReviews.length ? totalRating / relatedReviews.length : 0,
      reviewCount: relatedReviews.length,
    });
  });

  return metricsBySkill;
}

function applySkillFilters(skills, req) {
  const queryText = normalizeString(req.query?.q || req.query?.query).toLowerCase();
  const category = normalizeString(req.query?.category).toLowerCase();
  const level = normalizeString(req.query?.level).toLowerCase();
  const requestedMode = normalizeModeFilter(req.query?.mode);
  const mode = requestedMode || 'all';
  const location = normalizeString(req.query?.location).toLowerCase();
  const minPrice = normalizeNumber(req.query?.minPrice ?? req.query?.priceMin);
  const maxPrice = normalizeNumber(req.query?.maxPrice ?? req.query?.priceMax);
  const requestedMaxDistance = normalizeNumber(req.query?.maxDistance ?? req.query?.distanceKm);
  const maxDistance = requestedMaxDistance !== null ? requestedMaxDistance : DEFAULT_NEARBY_DISTANCE_KM;
  const shouldApplyDistanceFilter = mode !== 'online';
  const onlyBookable = parseBooleanQuery(req.query?.onlyBookable);
  const onlyMine = parseBooleanQuery(req.query?.mine);
  const includeOwn = parseBooleanQuery(req.query?.includeOwn);
  const viewerId = normalizeObjectIdString(req.user?._id || req.user?.id);
  const shouldExcludeOwnByDefault = req.user?.role === 'provider' && !includeOwn;
  const shouldExcludeOwn = shouldExcludeOwnByDefault || parseBooleanQuery(req.query?.excludeOwn);

  return skills.filter((skill) => {
    const skillHaystack = [
      skill.title,
      skill.category,
      skill.description,
      skill.location,
      skill.providerName,
      skill.mode,
      skill.level,
      ...(skill.tags || []),
      ...(skill.outcomes || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (queryText && !skillHaystack.includes(queryText)) {
      return false;
    }

    if (category && skill.category.toLowerCase() !== category) {
      return false;
    }

    if (level && skill.level.toLowerCase() !== level) {
      return false;
    }

    if (location && !String(skill.location || '').toLowerCase().includes(location)) {
      return false;
    }

    if (mode && mode !== 'all') {
      const modeGroup = getModeGroup(skill.mode);
      if (modeGroup !== mode && String(skill.mode || '').toLowerCase() !== mode) {
        return false;
      }
    }

    if (minPrice !== null && Number(skill.price || 0) < minPrice) {
      return false;
    }

    if (maxPrice !== null && Number(skill.price || 0) > maxPrice) {
      return false;
    }

    if (shouldApplyDistanceFilter && maxDistance !== null) {
      const effectiveMaxDistance =
        typeof skill.serviceRadiusKm === 'number'
          ? Math.min(maxDistance, skill.serviceRadiusKm)
          : maxDistance;

      if (typeof skill.distanceKm !== 'number' || skill.distanceKm > effectiveMaxDistance) {
        return false;
      }
    }

    if (onlyBookable && !skill.canBook) {
      return false;
    }

    if (onlyMine && viewerId && !skill.isOwnListing) {
      return false;
    }

    if (shouldExcludeOwn && skill.isOwnListing) {
      return false;
    }

    return true;
  });
}

function sortSkills(skills, req) {
  const sortBy = normalizeString(req.query?.sort || req.query?.sortBy).toLowerCase() || 'recommended';

  const sortedSkills = [...skills];

  switch (sortBy) {
    case 'rating':
      return sortedSkills.sort((first, second) => second.rating - first.rating);
    case 'price-low':
    case 'price_asc':
      return sortedSkills.sort((first, second) => first.price - second.price);
    case 'price-high':
    case 'price_desc':
      return sortedSkills.sort((first, second) => second.price - first.price);
    case 'newest':
      return sortedSkills.sort(
        (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
      );
    case 'recommended':
    default:
      return sortedSkills.sort((first, second) => {
        const firstScore =
          first.rating * 10 +
          first.learnersHelped * 0.08 -
          (typeof first.distanceKm === 'number' ? first.distanceKm : DEFAULT_NEARBY_DISTANCE_KM * 3);
        const secondScore =
          second.rating * 10 +
          second.learnersHelped * 0.08 -
          (typeof second.distanceKm === 'number' ? second.distanceKm : DEFAULT_NEARBY_DISTANCE_KM * 3);

        return secondScore - firstScore;
      });
  }
}

async function listSkills(req, res, next) {
  try {
    const viewerCoordinates = resolveViewerCoordinates(req);
    const skills = await Skill.find()
      .populate(buildPopulateOptions())
      .sort({ createdAt: -1 });
    const metricsBySkill = await buildMetricsBySkill(skills);
    const skillPayloads = skills.map((skill) =>
      buildSkillResponse(skill, {
        currentUser: req.user || null,
        viewerCoordinates,
        metrics: metricsBySkill.get(normalizeObjectIdString(skill._id)) || {},
      }),
    );
    const filteredSkills = applySkillFilters(skillPayloads, req);
    const sortedSkills = sortSkills(filteredSkills, req);
    const limit = parsePositiveIntegerQuery(req.query?.limit, 0);
    const finalSkills = limit ? sortedSkills.slice(0, limit) : sortedSkills;

    return res.status(200).json({
      success: true,
      count: finalSkills.length,
      total: sortedSkills.length,
      viewer: {
        isAuthenticated: Boolean(req.user),
        role: req.user?.role || 'guest',
        hasLocationCoordinates: Boolean(viewerCoordinates),
        defaultDistanceKm: DEFAULT_NEARBY_DISTANCE_KM,
        canCreateSkill: req.user?.role === 'provider' || req.user?.role === 'admin',
        canBookSkills: req.user?.role !== 'provider',
      },
      skills: finalSkills,
    });
  } catch (error) {
    return next(error);
  }
}

export const createSkill = async (req, res, next) => {
  try {
    const payload = {
      title: normalizeString(req.body?.title),
      description: normalizeString(req.body?.description),
      category: normalizeString(req.body?.category),
      price: normalizeNumber(req.body?.price),
      experience: normalizeNumber(req.body?.experience ?? req.body?.duration),
      location: normalizeString(req.body?.location ?? req.body?.area),
      mode: normalizeString(req.body?.mode) || 'Local meetup',
      level: normalizeString(req.body?.level) || 'all levels',
      availability: normalizeString(req.body?.availability),
      serviceRadius: normalizeString(req.body?.serviceRadius) || '10 km',
      tags: normalizeStringArray(req.body?.tags),
      locationCoordinates: resolveSkillCoordinatesFromRequest(req),
    };

    const validationError = validateCreatePayload(payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const currentUserCoordinates = normalizeLocationCoordinates({
      locationCoordinates: req.user?.locationCoordinates,
    });

    if (payload.locationCoordinates && !currentUserCoordinates) {
      await User.findByIdAndUpdate(req.user.id, {
        locationCoordinates: payload.locationCoordinates,
      });
      req.user.locationCoordinates = payload.locationCoordinates;
    }

    const createPayload = {
      userId: req.user.id,
      ...payload,
    };

    if (!payload.locationCoordinates) {
      delete createPayload.locationCoordinates;
    }

    const skill = await Skill.create(createPayload);

    const populatedSkill = await Skill.findById(skill._id).populate(buildPopulateOptions());
    const metricsBySkill = await buildMetricsBySkill([populatedSkill]);

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully.',
      skill: buildSkillResponse(populatedSkill, {
        currentUser: req.user,
        viewerCoordinates: normalizeLocationCoordinates({
          locationCoordinates: req.user?.locationCoordinates,
        }),
        metrics: metricsBySkill.get(normalizeObjectIdString(populatedSkill._id)) || {},
      }),
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllSkills = async (req, res, next) => listSkills(req, res, next);

export const searchSkills = async (req, res, next) => listSkills(req, res, next);

export const getSkillById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID.',
      });
    }

    const skill = await Skill.findById(req.params.id).populate(buildPopulateOptions());

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    const metricsBySkill = await buildMetricsBySkill([skill]);
    const viewerCoordinates = resolveViewerCoordinates(req);

    return res.status(200).json({
      success: true,
      skill: buildSkillResponse(skill, {
        currentUser: req.user || null,
        viewerCoordinates,
        metrics: metricsBySkill.get(normalizeObjectIdString(skill._id)) || {},
      }),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSkill = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID.',
      });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    const isOwner = skill.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this skill.',
      });
    }

    const updates = {};
    const hasLocationCoordinatePayload =
      req.body?.locationCoordinates !== undefined ||
      req.body?.latitude !== undefined ||
      req.body?.lat !== undefined ||
      req.body?.longitude !== undefined ||
      req.body?.lng !== undefined ||
      req.body?.lon !== undefined;
    const nextLocationCoordinates = normalizeLocationCoordinates(req.body || {});
    const normalizedFields = {
      title: req.body?.title !== undefined ? normalizeString(req.body.title) : undefined,
      description:
        req.body?.description !== undefined ? normalizeString(req.body.description) : undefined,
      category: req.body?.category !== undefined ? normalizeString(req.body.category) : undefined,
      price: req.body?.price !== undefined ? normalizeNumber(req.body.price) : undefined,
      experience:
        req.body?.experience !== undefined
          ? normalizeNumber(req.body.experience)
          : req.body?.duration !== undefined
            ? normalizeNumber(req.body.duration)
            : undefined,
      location:
        req.body?.location !== undefined
          ? normalizeString(req.body.location)
          : req.body?.area !== undefined
            ? normalizeString(req.body.area)
            : undefined,
      mode: req.body?.mode !== undefined ? normalizeString(req.body.mode) : undefined,
      level: req.body?.level !== undefined ? normalizeString(req.body.level) : undefined,
      availability:
        req.body?.availability !== undefined ? normalizeString(req.body.availability) : undefined,
      serviceRadius:
        req.body?.serviceRadius !== undefined ? normalizeString(req.body.serviceRadius) : undefined,
      tags: req.body?.tags !== undefined ? normalizeStringArray(req.body.tags) : undefined,
    };

    const validationError = validateUpdatePayload(normalizedFields);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    Object.entries(normalizedFields).forEach(([key, value]) => {
      if (value !== undefined) {
        updates[key] = value;
      }
    });

    if (hasLocationCoordinatePayload) {
      updates.locationCoordinates = nextLocationCoordinates || undefined;
    } else if (normalizedFields.location !== undefined) {
      // Keep location text and coordinates aligned. If location text changed without coordinates, reset stale coordinates.
      updates.locationCoordinates = undefined;
    }

    Object.assign(skill, updates);
    await skill.save();

    const updatedSkill = await Skill.findById(skill._id).populate(buildPopulateOptions());
    const metricsBySkill = await buildMetricsBySkill([updatedSkill]);

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully.',
      skill: buildSkillResponse(updatedSkill, {
        currentUser: req.user,
        viewerCoordinates: normalizeLocationCoordinates({
          locationCoordinates: req.user?.locationCoordinates,
        }),
        metrics: metricsBySkill.get(normalizeObjectIdString(updatedSkill._id)) || {},
      }),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSkill = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill ID.',
      });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    const isOwner = skill.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to delete this skill.',
      });
    }

    await skill.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully.',
    });
  } catch (error) {
    return next(error);
  }
};
