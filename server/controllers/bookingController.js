import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Skill from '../models/Skill.js';

const VALID_BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'canceled'];
const DEFAULT_BOOKING_ACCENT = 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)';

const BOOKING_POPULATE = [
  {
    path: 'skillId',
    select: 'title price category location userId',
    populate: {
      path: 'userId',
      select: 'name',
    },
  },
  {
    path: 'studentId',
    select: 'name',
  },
  {
    path: 'instructorId',
    select: 'name',
  },
];

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

function buildDefaultSchedule() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  date.setHours(18, 0, 0, 0);
  return date;
}

function normalizeDuration(value) {
  if (value === undefined || value === null || value === '') {
    return '60 min';
  }

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return `${Math.round(value)} min`;
  }

  return String(value).trim() || '60 min';
}

function normalizeMode(value) {
  const normalizedValue = String(value || '').trim().toLowerCase();

  if (normalizedValue.startsWith('online')) {
    return 'Online session';
  }

  if (normalizedValue.startsWith('offline')) {
    return 'Offline session';
  }

  if (normalizedValue.startsWith('hybrid')) {
    return 'Hybrid session';
  }

  return 'Online / offline by arrangement';
}

function buildAgendaFromSkill(skill, payloadAgenda) {
  if (Array.isArray(payloadAgenda) && payloadAgenda.length) {
    return payloadAgenda
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  return [
    `Clarify your goals for ${skill.title}.`,
    'Confirm the session structure and delivery format.',
    'Capture next steps and follow-up actions after the session.',
  ];
}

function resolveScheduledAt(payload) {
  if (payload.scheduledAt) {
    const scheduledAt = new Date(payload.scheduledAt);

    if (Number.isNaN(scheduledAt.getTime())) {
      return null;
    }

    return scheduledAt;
  }

  if (payload.date && payload.time) {
    const scheduledAt = new Date(`${payload.date}T${payload.time}`);

    if (Number.isNaN(scheduledAt.getTime())) {
      return null;
    }

    return scheduledAt;
  }

  return buildDefaultSchedule();
}

function buildLocationLabel(mode, payload, skill) {
  const explicitLocation = String(payload.location || payload.address || '').trim();

  if (mode === 'Online session') {
    return explicitLocation || 'Online room';
  }

  return explicitLocation || skill.location || 'Location to be confirmed';
}

function canAccessBooking(booking, currentUser) {
  if (currentUser.role === 'admin') {
    return true;
  }

  if (currentUser.role === 'provider') {
    return normalizeObjectIdString(booking.instructorId) === currentUser.id;
  }

  return normalizeObjectIdString(booking.studentId) === currentUser.id;
}

function canUpdateBookingStatus(booking, currentUser, nextStatus) {
  if (currentUser.role === 'admin') {
    return true;
  }

  const isStudent = normalizeObjectIdString(booking.studentId) === currentUser.id;
  const isInstructor = normalizeObjectIdString(booking.instructorId) === currentUser.id;

  if (nextStatus === 'canceled') {
    return isStudent || isInstructor;
  }

  if (nextStatus === 'confirmed' || nextStatus === 'completed') {
    return isInstructor;
  }

  return false;
}

function sortBookings(bookings) {
  const statusRank = {
    pending: 0,
    confirmed: 1,
    completed: 2,
    canceled: 3,
  };

  return [...bookings].sort((first, second) => {
    const statusDifference =
      (statusRank[first.status] ?? 99) - (statusRank[second.status] ?? 99);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return (
      new Date(first.scheduledAt || first.createdAt).getTime() -
      new Date(second.scheduledAt || second.createdAt).getTime()
    );
  });
}

function buildBookingResponse(booking) {
  const skill =
    booking.skillId && typeof booking.skillId === 'object' ? booking.skillId : null;
  const instructor =
    booking.instructorId && typeof booking.instructorId === 'object'
      ? booking.instructorId
      : skill?.userId && typeof skill.userId === 'object'
        ? skill.userId
        : null;
  const student =
    booking.studentId && typeof booking.studentId === 'object' ? booking.studentId : null;

  return {
    id: normalizeObjectIdString(booking._id),
    status: booking.status,
    scheduledAt: booking.scheduledAt,
    duration: booking.duration || '60 min',
    price: Number(booking.price || skill?.price || 0),
    currency: booking.currency || 'INR',
    mode: booking.mode || 'Online / offline by arrangement',
    location: booking.location || skill?.location || 'Online room',
    category: booking.category || skill?.category || 'Community skill',
    note: booking.note || '',
    agenda: Array.isArray(booking.agenda) ? booking.agenda : [],
    accent: booking.accent || DEFAULT_BOOKING_ACCENT,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    student: student
      ? {
          id: normalizeObjectIdString(student._id),
          name: student.name,
        }
      : {
          id: normalizeObjectIdString(booking.studentId),
          name: '',
        },
    instructor: {
      id: normalizeObjectIdString(instructor?._id || booking.instructorId),
      name: instructor?.name || '',
    },
    skill: skill
      ? {
          id: normalizeObjectIdString(skill._id),
          title: skill.title,
          price: skill.price,
          category: skill.category,
          location: skill.location,
          instructor: {
            id: normalizeObjectIdString(instructor?._id || booking.instructorId),
            name: instructor?.name || '',
          },
        }
      : null,
    skillTitle: skill?.title || 'Skill session',
    instructorName: instructor?.name || '',
  };
}

async function findAccessibleBooking(bookingId, currentUser) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return null;
  }

  const booking = await Booking.findById(bookingId).populate(BOOKING_POPULATE);

  if (!booking || !canAccessBooking(booking, currentUser)) {
    return null;
  }

  return booking;
}

export async function getMyBookings(req, res, next) {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : req.user.role === 'provider'
          ? { instructorId: req.user.id }
          : { studentId: req.user.id };

    const bookings = await Booking.find(query)
      .populate(BOOKING_POPULATE)
      .sort({ scheduledAt: 1, createdAt: -1 });

    return res.json(sortBookings(bookings.map(buildBookingResponse)));
  } catch (error) {
    return next(error);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await findAccessibleBooking(req.params.id, req.user);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    return res.json(buildBookingResponse(booking));
  } catch (error) {
    return next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    if (!['seeker', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Only users who hire skills can create bookings from search.',
      });
    }

    const payload = req.body || {};
    const skillId = String(payload.skillId || '').trim();

    if (!skillId) {
      return res.status(400).json({ error: 'skillId is required to create a booking.' });
    }

    if (!mongoose.Types.ObjectId.isValid(skillId)) {
      return res.status(400).json({ error: 'Invalid skill ID.' });
    }

    const skill = await Skill.findById(skillId).populate('userId', 'name');

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found.' });
    }

    if (normalizeObjectIdString(skill.userId) === req.user.id) {
      return res.status(400).json({ error: 'You cannot create a booking for your own skill.' });
    }

    const existingActiveBooking = await Booking.findOne({
      studentId: req.user.id,
      skillId,
      status: { $in: ['pending', 'confirmed'] },
    }).populate(BOOKING_POPULATE);

    if (existingActiveBooking) {
      return res.status(409).json({
        error: 'You already have an active booking request for this skill.',
        booking: buildBookingResponse(existingActiveBooking),
      });
    }

    const scheduledAt = resolveScheduledAt(payload);

    if (!scheduledAt) {
      return res.status(400).json({ error: 'Provide a valid booking date and time.' });
    }

    const mode = normalizeMode(payload.mode);
    const createdBooking = await Booking.create({
      studentId: req.user._id,
      instructorId: skill.userId._id || skill.userId,
      skillId: skill._id,
      scheduledAt,
      duration: normalizeDuration(payload.duration),
      status: 'pending',
      price: Number(payload.price ?? skill.price ?? 0),
      currency: String(payload.currency || 'INR').trim().toUpperCase() || 'INR',
      mode,
      location: buildLocationLabel(mode, payload, skill),
      category: String(payload.category || skill.category || 'Community skill').trim(),
      note:
        String(payload.note || payload.notes || '').trim() ||
        `Booking requested for ${skill.title}. Confirm the timing and final session details before the session starts.`,
      agenda: buildAgendaFromSkill(skill, payload.agenda),
      accent: String(payload.accent || '').trim() || DEFAULT_BOOKING_ACCENT,
    });

    const hydratedBooking = await Booking.findById(createdBooking._id).populate(BOOKING_POPULATE);

    return res.status(201).json(buildBookingResponse(hydratedBooking));
  } catch (error) {
    return next(error);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const nextStatus = String(req.body?.status || '').trim().toLowerCase();

    if (!VALID_BOOKING_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ error: 'status is invalid.' });
    }

    const booking = await findAccessibleBooking(req.params.id, req.user);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (!canUpdateBookingStatus(booking, req.user, nextStatus)) {
      return res.status(403).json({
        error: 'You do not have permission to update this booking status.',
      });
    }

    if (booking.status === 'canceled' && nextStatus !== 'canceled') {
      return res.status(400).json({
        error: 'A canceled booking cannot be moved to another status.',
      });
    }

    if (booking.status === 'completed' && nextStatus !== 'completed') {
      return res.status(400).json({
        error: 'A completed booking cannot be moved to another status.',
      });
    }

    booking.status = nextStatus;
    await booking.save();

    const refreshedBooking = await Booking.findById(booking._id).populate(BOOKING_POPULATE);
    return res.json(buildBookingResponse(refreshedBooking));
  } catch (error) {
    return next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await findAccessibleBooking(req.params.id, req.user);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (!canUpdateBookingStatus(booking, req.user, 'canceled')) {
      return res.status(403).json({
        error: 'You do not have permission to cancel this booking.',
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        error: 'A completed booking cannot be canceled.',
      });
    }

    booking.status = 'canceled';
    await booking.save();

    const refreshedBooking = await Booking.findById(booking._id).populate(BOOKING_POPULATE);
    return res.json(buildBookingResponse(refreshedBooking));
  } catch (error) {
    return next(error);
  }
}
