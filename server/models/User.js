import mongoose from 'mongoose';

function normalizePhoneForStorage(value) {
  const digitsOnly = String(value || '').trim().replace(/\D/g, '');
  return digitsOnly || undefined;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['provider', 'seeker'],
    default: 'seeker',
  },
  phone: {
    type: String,
    set: normalizePhoneForStorage,
  },
  location: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  fullAddress: {
    type: String,
    trim: true,
  },
  locationCoordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
  },
  bio: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  avatarUrl: {
    type: String,
    trim: true,
  },
  emailVerified: {
    type: Boolean,
    default: true,
  },
  phoneVerified: {
    type: Boolean,
    default: true,
  },
  emailOtpHash: {
    type: String,
    select: false,
  },
  emailOtpExpires: {
    type: Date,
    select: false,
  },
  emailOtpLastSentAt: {
    type: Date,
    select: false,
  },
  phoneOtpHash: {
    type: String,
    select: false,
  },
  phoneOtpExpires: {
    type: Date,
    select: false,
  },
  phoneOtpLastSentAt: {
    type: Date,
    select: false,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true, $type: 'string' },
    },
  },
);

const User = mongoose.model('User', userSchema);

export default User;
