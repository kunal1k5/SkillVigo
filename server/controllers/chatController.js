import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';

const MAX_MESSAGE_LENGTH = 2000;
const USER_CHAT_FIELDS = 'name role avatarUrl location';

function normalizeObjectIdString(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === 'object') {
    if ('_id' in value && value._id) {
      return normalizeObjectIdString(value._id);
    }

    if ('id' in value && value.id) {
      return String(value.id);
    }
  }

  return String(value);
}

function buildParticipantKey(firstUserId, secondUserId) {
  return [firstUserId, secondUserId].map(normalizeObjectIdString).sort().join(':');
}

function buildContextKey(skillId) {
  return skillId ? `skill:${normalizeObjectIdString(skillId)}` : 'direct';
}

function buildAvatarLabel(name = '') {
  const parts = String(name || '')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'SV';
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

function formatRoleLabel(role = '') {
  const normalizedRole = String(role || '').trim().toLowerCase();

  if (!normalizedRole) {
    return 'Conversation';
  }

  return normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
}

function getOtherParticipant(conversation, currentUserId) {
  const currentUserIdString = normalizeObjectIdString(currentUserId);
  return (conversation.participants || []).find(
    (participant) => normalizeObjectIdString(participant) !== currentUserIdString,
  );
}

function isParticipant(conversation, userId) {
  const userIdString = normalizeObjectIdString(userId);
  return (conversation.participants || []).some(
    (participant) => normalizeObjectIdString(participant) === userIdString,
  );
}

function isDeletedForUser(conversation, userId) {
  const userIdString = normalizeObjectIdString(userId);
  return (conversation.deletedFor || []).some(
    (participantId) => normalizeObjectIdString(participantId) === userIdString,
  );
}

function getReadState(conversation, userId) {
  const userIdString = normalizeObjectIdString(userId);
  return (conversation.readStates || []).find(
    (state) => normalizeObjectIdString(state.userId) === userIdString,
  );
}

function setConversationReadAt(conversation, userId, dateValue = new Date()) {
  const readState = getReadState(conversation, userId);

  if (readState) {
    readState.lastReadAt = dateValue;
  } else {
    conversation.readStates.push({
      userId,
      lastReadAt: dateValue,
    });
  }

  conversation.markModified('readStates');
}

function clearConversationDeletion(conversation, userIds = []) {
  const visibleToUsers = new Set(userIds.map(normalizeObjectIdString));
  conversation.deletedFor = (conversation.deletedFor || []).filter(
    (participantId) => !visibleToUsers.has(normalizeObjectIdString(participantId)),
  );
  conversation.markModified('deletedFor');
}

function buildConversationRole(participant, skill) {
  if (skill?.title && participant?.role === 'provider') {
    return `Provider | ${skill.title}`;
  }

  if (skill?.title) {
    return skill.title;
  }

  return formatRoleLabel(participant?.role);
}

function buildConversationResponse(conversation, currentUserId, unreadCount = 0) {
  const otherParticipant = getOtherParticipant(conversation, currentUserId);
  const skill = conversation.skillId && typeof conversation.skillId === 'object'
    ? conversation.skillId
    : null;
  const participantName = otherParticipant?.name || 'SkillVigo member';

  return {
    id: normalizeObjectIdString(conversation._id),
    participantId: normalizeObjectIdString(otherParticipant?._id || otherParticipant),
    participantName,
    role: buildConversationRole(otherParticipant, skill),
    avatar: buildAvatarLabel(participantName),
    avatarUrl: otherParticipant?.avatarUrl || '',
    isOnline: false,
    skillId: normalizeObjectIdString(skill?._id),
    skillTitle: skill?.title || '',
    lastMessage: conversation.lastMessageText || '',
    lastMessageAt: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt,
    unreadCount,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

function buildMessageResponse(message, currentUserId, conversation) {
  const senderId = normalizeObjectIdString(message.senderId);
  const otherParticipant = getOtherParticipant(conversation, currentUserId);
  const senderName = senderId === normalizeObjectIdString(currentUserId)
    ? 'You'
    : message.senderId?.name || otherParticipant?.name || 'SkillVigo member';

  return {
    id: normalizeObjectIdString(message._id),
    conversationId: normalizeObjectIdString(message.conversationId),
    senderId,
    senderRole: senderId === normalizeObjectIdString(currentUserId) ? 'me' : 'participant',
    senderName,
    content: message.content,
    createdAt: message.createdAt,
  };
}

async function getUnreadCountForConversation(conversation, currentUserId) {
  const filter = {
    conversationId: conversation._id,
    senderId: { $ne: reqUserObjectId(currentUserId) },
  };
  const readState = getReadState(conversation, currentUserId);

  if (readState?.lastReadAt) {
    filter.createdAt = { $gt: readState.lastReadAt };
  }

  return Message.countDocuments(filter);
}

function reqUserObjectId(userId) {
  return new mongoose.Types.ObjectId(normalizeObjectIdString(userId));
}

async function loadConversation(conversationId, currentUserId, options = {}) {
  const {
    allowDeleted = false,
    populate = false,
  } = options;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return null;
  }

  let query = Conversation.findById(conversationId);

  if (populate) {
    query = query
      .populate('participants', USER_CHAT_FIELDS)
      .populate('skillId', 'title category location userId');
  }

  const conversation = await query;

  if (!conversation || !isParticipant(conversation, currentUserId)) {
    return null;
  }

  if (!allowDeleted && isDeletedForUser(conversation, currentUserId)) {
    return null;
  }

  return conversation;
}

export async function createOrOpenConversation(req, res, next) {
  try {
    const skillId = String(req.body?.skillId || '').trim();
    const participantId = String(req.body?.participantId || '').trim();

    if (!skillId && !participantId) {
      return res.status(400).json({
        error: 'skillId or participantId is required.',
      });
    }

    let skill = null;

    if (skillId) {
      if (!['seeker', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Only users who hire skills can start a new provider conversation from search.',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(skillId)) {
        return res.status(400).json({
          error: 'Invalid skill ID.',
        });
      }

      skill = await Skill.findById(skillId).populate('userId', USER_CHAT_FIELDS);

      if (!skill) {
        return res.status(404).json({
          error: 'Skill not found.',
        });
      }
    }

    const resolvedParticipantId = participantId || normalizeObjectIdString(skill?.userId);

    if (!resolvedParticipantId || !mongoose.Types.ObjectId.isValid(resolvedParticipantId)) {
      return res.status(400).json({
        error: 'A valid participantId is required.',
      });
    }

    if (
      skill &&
      participantId &&
      normalizeObjectIdString(skill.userId) !== normalizeObjectIdString(participantId)
    ) {
      return res.status(400).json({
        error: 'The selected skill does not belong to the chosen participant.',
      });
    }

    if (normalizeObjectIdString(req.user.id) === normalizeObjectIdString(resolvedParticipantId)) {
      return res.status(400).json({
        error: 'You cannot start a chat with yourself.',
      });
    }

    const participant =
      skill?.userId && normalizeObjectIdString(skill.userId) === normalizeObjectIdString(resolvedParticipantId)
        ? skill.userId
        : await User.findById(resolvedParticipantId).select(USER_CHAT_FIELDS);

    if (!participant) {
      return res.status(404).json({
        error: 'Participant not found.',
      });
    }

    const participantKey = buildParticipantKey(req.user.id, resolvedParticipantId);
    const contextKey = buildContextKey(skill?._id);
    let conversation = await Conversation.findOne({ participantKey, contextKey });
    let wasCreated = false;

    if (!conversation) {
      const now = new Date();

      try {
        conversation = await Conversation.create({
          participants: [req.user._id, participant._id],
          participantKey,
          contextKey,
          skillId: skill?._id || null,
          lastMessageAt: now,
          readStates: [
            { userId: req.user._id, lastReadAt: now },
            { userId: participant._id, lastReadAt: now },
          ],
        });
        wasCreated = true;
      } catch (error) {
        if (error?.code !== 11000) {
          throw error;
        }

        conversation = await Conversation.findOne({ participantKey, contextKey });
      }
    }

    if (!conversation) {
      return res.status(500).json({
        error: 'Could not open the conversation right now.',
      });
    }

    clearConversationDeletion(conversation, [req.user.id]);
    setConversationReadAt(conversation, req.user.id, new Date());
    await conversation.save();

    const hydratedConversation = await Conversation.findById(conversation._id)
      .populate('participants', USER_CHAT_FIELDS)
      .populate('skillId', 'title category location userId');

    return res.status(wasCreated ? 201 : 200).json({
      success: true,
      created: wasCreated,
      conversation: buildConversationResponse(hydratedConversation, req.user.id, 0),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      deletedFor: { $ne: req.user.id },
    })
      .populate('participants', USER_CHAT_FIELDS)
      .populate('skillId', 'title category location userId')
      .sort({ lastMessageAt: -1, updatedAt: -1, createdAt: -1 });

    const conversationPayloads = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await getUnreadCountForConversation(conversation, req.user.id);
        return buildConversationResponse(conversation, req.user.id, unreadCount);
      }),
    );

    return res.json(conversationPayloads);
  } catch (error) {
    return next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const conversation = await loadConversation(req.params.conversationId, req.user.id, {
      populate: true,
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    setConversationReadAt(conversation, req.user.id, new Date());
    clearConversationDeletion(conversation, [req.user.id]);
    await conversation.save();

    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });

    return res.json(
      messages.map((message) => buildMessageResponse(message, req.user.id, conversation)),
    );
  } catch (error) {
    return next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const conversationId = String(req.body?.conversationId || '').trim();
    const content = String(req.body?.content || '').trim();

    if (!conversationId || !content) {
      return res.status(400).json({
        error: 'conversationId and content are required.',
      });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message cannot be longer than ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const conversation = await loadConversation(conversationId, req.user.id, {
      allowDeleted: true,
      populate: true,
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    const createdMessage = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      content,
    });

    const now = createdMessage.createdAt || new Date();
    clearConversationDeletion(
      conversation,
      (conversation.participants || []).map((participant) => normalizeObjectIdString(participant)),
    );
    setConversationReadAt(conversation, req.user.id, now);
    conversation.lastMessageText = content;
    conversation.lastMessageAt = now;
    conversation.lastMessageSenderId = req.user._id;
    await conversation.save();

    const hydratedConversation = await Conversation.findById(conversation._id)
      .populate('participants', USER_CHAT_FIELDS)
      .populate('skillId', 'title category location userId');
    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });

    return res.status(201).json({
      conversation: buildConversationResponse(hydratedConversation, req.user.id, 0),
      messages: messages.map((message) =>
        buildMessageResponse(message, req.user.id, hydratedConversation),
      ),
    });
  } catch (error) {
    return next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const conversationId = String(req.body?.conversationId || '').trim();

    if (!conversationId) {
      return res.status(400).json({
        error: 'conversationId is required.',
      });
    }

    const conversation = await loadConversation(conversationId, req.user.id, {
      populate: true,
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    setConversationReadAt(conversation, req.user.id, new Date());
    clearConversationDeletion(conversation, [req.user.id]);
    await conversation.save();

    return res.json(buildConversationResponse(conversation, req.user.id, 0));
  } catch (error) {
    return next(error);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const conversation = await loadConversation(req.params.conversationId, req.user.id, {
      allowDeleted: true,
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found.',
      });
    }

    if (!isDeletedForUser(conversation, req.user.id)) {
      conversation.deletedFor.push(req.user._id);
      conversation.markModified('deletedFor');
      await conversation.save();
    }

    return res.json({
      success: true,
      conversationId: normalizeObjectIdString(conversation._id),
    });
  } catch (error) {
    return next(error);
  }
}
