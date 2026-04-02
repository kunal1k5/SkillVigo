/**
 * Mongoose Schema: Review
 * 
 * Fields:
 * - booking: Reference to Booking
 * - reviewer: Reference to User
 * - reviewee: Reference to User
 * - skill: Reference to Skill
 * - rating: 1-5 star rating
 * - comment: Review text
 * - createdAt: Timestamp
 */

// const reviewSchema = new Schema({
//   booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
//   reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
//   rating: { type: Number, min: 1, max: 5, required: true },
//   comment: String,
//   createdAt: { type: Date, default: Date.now },
// });

// export default model('Review', reviewSchema);
