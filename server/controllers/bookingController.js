import { createId, readDatabase, updateDatabase } from '../data/dataStore.js';

const VALID_BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'canceled'];

function getInstructorSkillIds(skills, userId) {
  return new Set(
    skills.filter((skill) => skill.instructorId === userId).map((skill) => skill.id),
  );
}

function canAccessBooking(skills, booking, currentUser) {
  if (currentUser.role === 'admin') {
    return true;
  }

  if (booking.studentId === currentUser.id) {
    return true;
  }

  return skills.some(
    (skill) => skill.id === booking.skillId && skill.instructorId === currentUser.id,
  );
}

function hydrateBooking(booking, skills) {
  const skill = skills.find((item) => item.id === booking.skillId);

  return {
    ...booking,
    skill: skill
      ? {
          id: skill.id,
          title: skill.title,
          price: skill.price,
          instructor: {
            id: skill.instructorId,
            name: skill.instructorName,
          },
        }
      : null,
    skillTitle: skill?.title || booking.skillTitle || 'Unknown skill',
    instructorName: skill?.instructorName || booking.instructorName || 'Unknown instructor',
  };
}

function buildDefaultSchedule() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  date.setHours(18, 0, 0, 0);
  return date.toISOString();
}

function buildBookingPayload(payload, skill, currentUser) {
  return {
    id: createId('booking'),
    studentId: currentUser.id,
    skillId: skill.id,
    scheduledAt: payload.scheduledAt || buildDefaultSchedule(),
    duration: payload.duration || `${skill.duration || 60} min`,
    status: payload.status || 'pending',
    price: Number(payload.price || skill.price || 0),
    currency: payload.currency || skill.currency || 'INR',
    mode: payload.mode || skill.mode || 'Local meetup',
    location:
      payload.location ||
      (skill.mode?.toLowerCase().includes('online') ? 'Online room' : `${skill.area} meetup point`),
    category: payload.category || skill.category || 'Community skill',
    note:
      payload.note ||
      `Booking requested for ${skill.title}. Confirm time and final session details in chat before the meetup.`,
    agenda: Array.isArray(payload.agenda) && payload.agenda.length
      ? payload.agenda
      : (skill.outcomes || []).slice(0, 3),
    accent: payload.accent || skill.accent,
    createdAt: new Date().toISOString(),
  };
}

export async function getMyBookings(req, res, next) {
  try {
    const database = await readDatabase();
    const instructorSkillIds = getInstructorSkillIds(database.skills, req.user.id);
    const bookings = database.bookings
      .filter(
        (booking) =>
          req.user.role === 'admin' ||
          booking.studentId === req.user.id ||
          instructorSkillIds.has(booking.skillId),
      )
      .map((booking) => hydrateBooking(booking, database.skills))
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    res.json(bookings);
  } catch (error) {
    next(error);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const database = await readDatabase();
    const booking = database.bookings.find((item) => item.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!canAccessBooking(database.skills, booking, req.user)) {
      return res.status(403).json({ error: 'You do not have permission to access this booking.' });
    }

    return res.json(hydrateBooking(booking, database.skills));
  } catch (error) {
    return next(error);
  }
}

export async function createBooking(req, res, next) {
  try {
    const payload = req.body || {};

    if (!payload.skillId) {
      return res.status(400).json({ error: 'skillId is required to create a booking' });
    }

    let createdBooking = null;

    const database = await updateDatabase((currentDatabase) => {
      const skill = currentDatabase.skills.find((item) => item.id === payload.skillId);

      if (!skill) {
        throw Object.assign(new Error('Skill not found'), { status: 404 });
      }

      if (skill.instructorId === req.user.id) {
        throw Object.assign(new Error('You cannot create a booking for your own skill.'), {
          status: 400,
        });
      }

      createdBooking = buildBookingPayload(payload, skill, req.user);
      currentDatabase.bookings.unshift(createdBooking);
      return currentDatabase;
    });

    return res.status(201).json(hydrateBooking(createdBooking, database.skills));
  } catch (error) {
    return next(error);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const nextStatus = req.body?.status;

    if (!nextStatus) {
      return res.status(400).json({ error: 'status is required' });
    }

    if (!VALID_BOOKING_STATUSES.includes(nextStatus)) {
      return res.status(400).json({ error: 'status is invalid' });
    }

    let updatedBooking = null;

    const database = await updateDatabase((currentDatabase) => {
      currentDatabase.bookings = currentDatabase.bookings.map((booking) => {
        if (booking.id !== req.params.id) {
          return booking;
        }

        if (!canAccessBooking(currentDatabase.skills, booking, req.user)) {
          throw Object.assign(new Error('You do not have permission to update this booking.'), {
            status: 403,
          });
        }

        updatedBooking = {
          ...booking,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        };

        return updatedBooking;
      });

      return currentDatabase;
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json(hydrateBooking(updatedBooking, database.skills));
  } catch (error) {
    return next(error);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    let canceledBooking = null;

    const database = await updateDatabase((currentDatabase) => {
      currentDatabase.bookings = currentDatabase.bookings.map((booking) => {
        if (booking.id !== req.params.id) {
          return booking;
        }

        if (!canAccessBooking(currentDatabase.skills, booking, req.user)) {
          throw Object.assign(new Error('You do not have permission to cancel this booking.'), {
            status: 403,
          });
        }

        canceledBooking = {
          ...booking,
          status: 'canceled',
          updatedAt: new Date().toISOString(),
        };

        return canceledBooking;
      });

      return currentDatabase;
    });

    if (!canceledBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json(hydrateBooking(canceledBooking, database.skills));
  } catch (error) {
    return next(error);
  }
}
