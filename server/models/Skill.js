/**
 * Mongoose Schema: Skill
 * 
 * Fields:
 * - title: Skill name
 * - description: Detailed description
 * - instructor: Reference to User
 * - category: Skill category
 * - price: Per-session price
 * - duration: Session duration (minutes)
 * - rating: Average rating
 * - reviews: Review count
 * - image: Skill image URL
 * - tags: Search tags
 * - availability: Available time slots
 * - isActive: Listing status
 * - createdAt: Timestamp
 */

// const skillSchema = new Schema({
//   title: { type: String, required: true },
//   description: String,
//   instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   category: String,
//   price: Number,
//   duration: Number,
//   rating: Number,
//   reviews: Number,
//   image: String,
//   tags: [String],
//   availability: [{ day: String, slots: [String] }],
//   isActive: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now },
// });

// export default model('Skill', skillSchema);
