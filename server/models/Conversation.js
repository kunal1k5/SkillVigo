import mongoose from 'mongoose';

const participantStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      ],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length === 2;
        },
        message: 'A conversation must include exactly two participants.',
      },
    },
    participantKey: {
      type: String,
      required: true,
      trim: true,
    },
    contextKey: {
      type: String,
      required: true,
      trim: true,
      default: 'direct',
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      default: null,
    },
    lastMessageText: {
      type: String,
      trim: true,
      default: '',
      maxlength: 2000,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deletedFor: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    readStates: {
      type: [participantStateSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ participantKey: 1, contextKey: 1 }, { unique: true });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
