/**
 * Mongoose Schema: User
 * 
 * Fields:
 * - uid: Firebase UID (unique identifier)
 * - email: User email
 * - displayName: User's display name
 * - photoURL: Profile picture
 * - phone: Contact number
 * - bio: User bio
 * - skills: Array of skill references
 * - ratings: Aggregated ratings
 * - isVerified: Email verification status
 * - role: user | instructor | admin
 * - createdAt: Timestamp
 * - updatedAt: Timestamp
 */

// const userSchema = new Schema({
//   uid: { type: String, unique: true, required: true },
//   email: { type: String, unique: true, required: true },
//   displayName: String,
//   photoURL: String,
//   phone: String,
//   bio: String,
//   skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
//   ratings: { average: Number, count: Number },
//   isVerified: { type: Boolean, default: false },
//   role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'user' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// export default model('User', userSchema);
