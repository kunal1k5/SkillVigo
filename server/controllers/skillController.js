import mongoose from 'mongoose';
import Skill from '../models/Skill.js';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
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
    price: skill.price,
    experience: skill.experience,
    location: skill.location,
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
      experience: normalizeNumber(req.body?.experience),
      location: normalizeString(req.body?.location),
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

    if (skill.userId.toString() !== req.user.id) {
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
        req.body?.experience !== undefined ? normalizeNumber(req.body.experience) : undefined,
      location: req.body?.location !== undefined ? normalizeString(req.body.location) : undefined,
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

    if (skill.userId.toString() !== req.user.id) {
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
