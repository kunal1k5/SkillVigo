/**
 * Mongoose Schema: Booking
 * 
 * Fields:
 * - student: Reference to User (learner)
 * - instructor: Reference to User (teacher)
 * - skill: Reference to Skill
 * - scheduledDate: Booking date
 * - status: pending | confirmed | completed | cancelled
 * - totalPrice: Total booking price
 * - paymentStatus: unpaid | paid | refunded
 * - notes: Special requests
 * - createdAt: Timestamp
 */

// const bookingSchema = new Schema({
//   student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   skill: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
//   scheduledDate: { type: Date, required: true },
//   status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
//   totalPrice: Number,
//   paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
//   notes: String,
//   createdAt: { type: Date, default: Date.now },
// });

// export default model('Booking', bookingSchema);
