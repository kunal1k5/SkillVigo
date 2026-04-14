import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  mode: {
    type: String,
    trim: true,
    default: 'Local meetup',
  },
  level: {
    type: String,
    trim: true,
    default: 'all levels',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
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
  availability: {
    type: String,
    trim: true,
    default: '',
  },
  serviceRadius: {
    type: String,
    trim: true,
    default: '10 km',
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
