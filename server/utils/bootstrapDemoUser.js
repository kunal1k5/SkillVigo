import mongoose from 'mongoose';
import { updateDatabase } from '../data/dataStore.js';
import User from '../models/User.js';

export const DEMO_USER = {
  id: '65f97b2c0b1f3c1d2e3f4a5b',
  name: 'Kunal',
  email: 'demo@skillvigo.com',
  password: 'Demo@123456',
  role: 'seeker',
  phone: '',
  location: 'Ghaziabad',
};

async function syncLegacySeedData(user) {
  await updateDatabase((currentDatabase) => {
    const nextUserId = user._id.toString();

    currentDatabase.currentUser = {
      id: nextUserId,
      name: user.name,
      area: user.location || 'Unknown location',
    };

    currentDatabase.bookings = (currentDatabase.bookings || []).map((booking) =>
      booking.studentId === 'user-me'
        ? {
            ...booking,
            studentId: nextUserId,
          }
        : booking,
    );

    currentDatabase.reviews = (currentDatabase.reviews || []).map((review) => ({
      ...review,
      reviewerId: review.reviewerId === 'user-me' ? nextUserId : review.reviewerId,
    }));

    return currentDatabase;
  });
}

export async function ensureDemoUser() {
  let demoUser = await User.findById(DEMO_USER.id);

  if (!demoUser) {
    demoUser = await User.findOne({ email: DEMO_USER.email });
  }

  if (!demoUser) {
    demoUser = await User.create({
      _id: new mongoose.Types.ObjectId(DEMO_USER.id),
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      role: DEMO_USER.role,
      phone: DEMO_USER.phone,
      location: DEMO_USER.location,
    });
  }

  await syncLegacySeedData(demoUser);

  return demoUser;
}
