import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: String,
      trim: true,
      default: '60 min',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'canceled'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'INR',
    },
    mode: {
      type: String,
      trim: true,
      default: 'Online / offline by arrangement',
    },
    location: {
      type: String,
      trim: true,
      default: 'Online room',
    },
    category: {
      type: String,
      trim: true,
      default: 'Community skill',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    agenda: {
      type: [String],
      default: [],
    },
    accent: {
      type: String,
      trim: true,
      default: 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ studentId: 1, createdAt: -1 });
bookingSchema.index({ instructorId: 1, createdAt: -1 });
bookingSchema.index({ skillId: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
