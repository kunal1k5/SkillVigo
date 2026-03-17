import { createId, readDatabase, updateDatabase } from '../data/dataStore.js';

function toNumber(value, fallback = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function buildDistanceLabel(distanceKm) {
  return typeof distanceKm === 'number' ? `${distanceKm.toFixed(1)} km away` : 'Nearby';
}

function normalizeSkill(skill) {
  return {
    ...skill,
    distanceLabel: skill.distanceLabel || buildDistanceLabel(skill.distanceKm),
  };
}

function applySkillFilters(skills, query) {
  const searchTerm = query.search?.toLowerCase().trim() || '';
  const category = query.category?.trim() || '';
  const mode = query.mode?.toLowerCase().trim() || '';
  const withinRadiusOnly = query.withinRadius === 'true';

  return skills.filter((skill) => {
    const matchesCategory = !category || skill.category === category;
    const normalizedMode = (skill.mode || '').toLowerCase();
    const matchesMode =
      !mode ||
      normalizedMode.includes(mode) ||
      (mode === 'local' && !normalizedMode.includes('online') && !normalizedMode.includes('hybrid'));
    const matchesRadius = !withinRadiusOnly || skill.distanceKm <= 10;

    if (!matchesCategory || !matchesMode || !matchesRadius) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const searchHaystack = [
      skill.title,
      skill.category,
      skill.instructorName,
      skill.area,
      skill.description,
      ...(skill.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchHaystack.includes(searchTerm);
  });
}

function buildSkillFromPayload(payload, currentUser, existingSkill = {}) {
  return {
    ...existingSkill,
    title: payload.title?.trim() || existingSkill.title || 'Untitled skill',
    category: payload.category?.trim() || existingSkill.category || 'Community skill',
    instructorId: existingSkill.instructorId || currentUser.id,
    instructorName: existingSkill.instructorName || currentUser.name,
    rating: existingSkill.rating || 5,
    price: toNumber(payload.price, existingSkill.price || 0),
    currency: payload.currency || existingSkill.currency || 'INR',
    mode: payload.mode?.trim() || existingSkill.mode || 'Local meetup',
    level: payload.level?.trim() || existingSkill.level || 'Beginner',
    distanceKm: toNumber(payload.distanceKm, existingSkill.distanceKm || 1.5),
    area: payload.area?.trim() || existingSkill.area || currentUser.location || 'Unknown location',
    responseTime: existingSkill.responseTime || 'Usually replies in 20 min',
    availability: Array.isArray(payload.availability)
      ? payload.availability.join(', ')
      : payload.availability?.trim() || existingSkill.availability || 'Add your availability',
    learnersHelped: existingSkill.learnersHelped || 0,
    duration: toNumber(payload.duration, existingSkill.duration || 60),
    serviceRadius: payload.serviceRadius?.trim() || existingSkill.serviceRadius || '10 km',
    accent: existingSkill.accent || 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
    description:
      payload.description?.trim() ||
      existingSkill.description ||
      'A practical local skill offering for the SkillVigo community.',
    tags: Array.isArray(payload.tags)
      ? payload.tags.filter(Boolean)
      : payload.tags
          ?.split(',')
          .map((item) => item.trim())
          .filter(Boolean) || existingSkill.tags || [],
    outcomes: Array.isArray(payload.outcomes)
      ? payload.outcomes.filter(Boolean)
      : existingSkill.outcomes || [
          'Get clear practical support.',
          'Learn through a real local session.',
          'Move quickly from discovery to action.',
        ],
    imageName: payload.imageFileName || existingSkill.imageName || '',
    createdAt: existingSkill.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getAllSkills(req, res, next) {
  try {
    const database = await readDatabase();
    const skills = applySkillFilters(database.skills.map(normalizeSkill), req.query).sort(
      (first, second) => first.distanceKm - second.distanceKm,
    );
    res.json(skills);
  } catch (error) {
    next(error);
  }
}

export async function searchSkills(req, res, next) {
  return getAllSkills(req, res, next);
}

export async function getSkillById(req, res, next) {
  try {
    const database = await readDatabase();
    const skill = database.skills.find((item) => item.id === req.params.id);

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    return res.json(normalizeSkill(skill));
  } catch (error) {
    return next(error);
  }
}

export async function createSkill(req, res, next) {
  try {
    const payload = req.body || {};

    if (!payload.title?.trim()) {
      return res.status(400).json({ error: 'Skill title is required' });
    }

    const database = await updateDatabase((currentDatabase) => {
      const nextSkill = {
        id: createId('skill'),
        ...buildSkillFromPayload(payload, req.user),
      };

      currentDatabase.skills.unshift(nextSkill);
      return currentDatabase;
    });

    const createdSkill = database.skills[0];
    return res.status(201).json(normalizeSkill(createdSkill));
  } catch (error) {
    return next(error);
  }
}

export async function updateSkill(req, res, next) {
  try {
    const payload = req.body || {};
    let updatedSkill = null;

    const database = await updateDatabase((currentDatabase) => {
      currentDatabase.skills = currentDatabase.skills.map((skill) => {
        if (skill.id !== req.params.id) {
          return skill;
        }

        if (skill.instructorId !== req.user.id && req.user.role !== 'admin') {
          throw Object.assign(new Error('You do not have permission to update this skill.'), {
            status: 403,
          });
        }

        updatedSkill = {
          ...skill,
          ...buildSkillFromPayload(payload, req.user, skill),
        };

        return updatedSkill;
      });

      return currentDatabase;
    });

    if (!updatedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    return res.json(normalizeSkill(database.skills.find((item) => item.id === req.params.id)));
  } catch (error) {
    return next(error);
  }
}

export async function deleteSkill(req, res, next) {
  try {
    let deletedSkill = null;

    await updateDatabase((currentDatabase) => {
      deletedSkill = currentDatabase.skills.find((skill) => skill.id === req.params.id) || null;

      if (
        deletedSkill &&
        deletedSkill.instructorId !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        throw Object.assign(new Error('You do not have permission to delete this skill.'), {
          status: 403,
        });
      }

      currentDatabase.skills = currentDatabase.skills.filter((skill) => skill.id !== req.params.id);
      currentDatabase.bookings = currentDatabase.bookings.filter((booking) => booking.skillId !== req.params.id);
      currentDatabase.conversations = currentDatabase.conversations.filter(
        (conversation) => conversation.skillId !== req.params.id,
      );
      currentDatabase.reviews = (currentDatabase.reviews || []).filter(
        (review) => review.skillId !== req.params.id,
      );
      currentDatabase.messages = currentDatabase.messages.filter((message) =>
        currentDatabase.conversations.some((conversation) => conversation.id === message.conversationId),
      );
      return currentDatabase;
    });

    if (!deletedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    return res.json({ success: true, deletedSkillId: req.params.id });
  } catch (error) {
    return next(error);
  }
}
