/**
 * Mongoose Schema: Message
 * 
 * For real-time chat system
 * 
 * Fields:
 * - sender: Reference to User
 * - receiver: Reference to User
 * - conversationId: Group chat identifier
 * - text: Message content
 * - isRead: Read status
 * - createdAt: Timestamp
 */

// const messageSchema = new Schema({
//   sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   conversationId: String,
//   text: { type: String, required: true },
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

// export default model('Message', messageSchema);
