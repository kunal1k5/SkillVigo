import mongoose from 'mongoose';
import Skill from '../models/Skill.js';

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

const buildSkillResponse = (skill) => {
  let provider = null;

  if (skill.userId && typeof skill.userId === 'object' && 'name' in skill.userId) {
    provider = {
      id: skill.userId._id?.toString() || skill.userId.id,
      name: skill.userId.name,
      location: skill.userId.location || '',
      rating: typeof skill.userId.rating === 'number' ? skill.userId.rating : undefined,
    };
  } else if (skill.userId) {
    provider = {
      id: skill.userId.toString(),
    };
  }

  return {
    id: skill._id.toString(),
    title: skill.title,
    description: skill.description,
    category: skill.category,
    mode: skill.mode,
    level: skill.level,
    price: skill.price,
    experience: skill.experience,
    location: skill.location,
    availability: skill.availability,
    serviceRadius: skill.serviceRadius,
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    createdAt: skill.createdAt,
    provider,
  };
};

const validateCreatePayload = ({ title, description, category, price, experience, location }) => {
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
};

const validateUpdatePayload = ({ title, description, category, price, experience, location }) => {
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
};

const buildPopulateOptions = () => ({
  path: 'userId',
  select: 'name location rating',
});

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
    };

    const validationError = validateCreatePayload(payload);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const skill = await Skill.create({
      userId: req.user.id,
      ...payload,
    });

    const populatedSkill = await Skill.findById(skill._id).populate(buildPopulateOptions());

    return res.status(201).json({
      success: true,
      message: 'Skill created successfully.',
      skill: buildSkillResponse(populatedSkill),
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find()
      .populate(buildPopulateOptions())
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills: skills.map(buildSkillResponse),
    });
  } catch (error) {
    return next(error);
  }
};

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

    return res.status(200).json({
      success: true,
      skill: buildSkillResponse(skill),
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

    Object.assign(skill, updates);
    await skill.save();

    const updatedSkill = await Skill.findById(skill._id).populate(buildPopulateOptions());

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully.',
      skill: buildSkillResponse(updatedSkill),
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
