import { readDatabase, updateDatabase } from '../data/dataStore.js';
import User from '../models/User.js';
import { sanitizeUser } from '../utils/auth.js';

const VALID_ROLES = ['provider', 'seeker', 'admin'];

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (error) {
    return next(error);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body || {};

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'role is invalid.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

export async function getAllSkills(req, res, next) {
  try {
    const database = await readDatabase();
    return res.json(database.skills);
  } catch (error) {
    return next(error);
  }
}

export async function removeSkill(req, res, next) {
  try {
    let deletedSkill = null;

    await updateDatabase((currentDatabase) => {
      deletedSkill = currentDatabase.skills.find((skill) => skill.id === req.params.id) || null;
      currentDatabase.skills = currentDatabase.skills.filter((skill) => skill.id !== req.params.id);
      currentDatabase.bookings = currentDatabase.bookings.filter((booking) => booking.skillId !== req.params.id);
      currentDatabase.reviews = (currentDatabase.reviews || []).filter(
        (review) => review.skillId !== req.params.id,
      );
      return currentDatabase;
    });

    if (!deletedSkill) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    return res.json({ success: true, deletedSkillId: deletedSkill.id });
  } catch (error) {
    return next(error);
  }
}

export async function getAllBookings(req, res, next) {
  try {
    const database = await readDatabase();
    return res.json(database.bookings);
  } catch (error) {
    return next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const [users, database] = await Promise.all([User.find(), readDatabase()]);

    return res.json({
      users: users.length,
      providers: users.filter((user) => user.role === 'provider').length,
      seekers: users.filter((user) => user.role === 'seeker').length,
      admins: users.filter((user) => user.role === 'admin').length,
      skills: database.skills.length,
      bookings: database.bookings.length,
      reviews: (database.reviews || []).length,
      conversations: database.conversations.length,
    });
  } catch (error) {
    return next(error);
  }
}
