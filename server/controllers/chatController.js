import { createId, readDatabase, updateDatabase } from '../data/dataStore.js';

function buildDistanceLabel(distanceKm) {
  return typeof distanceKm === 'number' ? `${distanceKm.toFixed(1)} km away` : 'Nearby';
}

function getConversationMessages(messages, conversationId) {
  return messages
    .filter((message) => message.conversationId === conversationId)
    .sort((first, second) => new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime());
}

function hydrateConversation(conversation, skills, messages) {
  const skill = skills.find((item) => item.id === conversation.skillId);
  const conversationMessages = getConversationMessages(messages, conversation.id);
  const lastMessage = conversationMessages[conversationMessages.length - 1];

  return {
    ...conversation,
    skillTitle: skill?.title || 'Skill support',
    distanceLabel: buildDistanceLabel(conversation.distanceKm),
    lastMessage: lastMessage?.content || '',
    lastMessageAt: lastMessage?.createdAt || conversation.updatedAt || conversation.createdAt,
  };
}

export async function getConversations(req, res, next) {
  try {
    const database = await readDatabase();
    const conversations = database.conversations
      .map((conversation) => hydrateConversation(conversation, database.skills, database.messages))
      .sort((first, second) => new Date(second.lastMessageAt).getTime() - new Date(first.lastMessageAt).getTime());

    res.json(conversations);
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const database = await updateDatabase((currentDatabase) => {
      currentDatabase.conversations = currentDatabase.conversations.map((conversation) =>
        conversation.id === req.params.conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation,
      );

      return currentDatabase;
    });

    const conversation = database.conversations.find((item) => item.id === req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = getConversationMessages(database.messages, req.params.conversationId);
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const payload = req.body || {};

    if (!payload.conversationId || !payload.content?.trim()) {
      return res.status(400).json({ error: 'conversationId and content are required' });
    }

    let responsePayload = null;

    const database = await updateDatabase((currentDatabase) => {
      const conversation = currentDatabase.conversations.find(
        (item) => item.id === payload.conversationId,
      );

      if (!conversation) {
        throw Object.assign(new Error('Conversation not found'), { status: 404 });
      }

      const createdAt = new Date().toISOString();
      const userMessage = {
        id: createId('msg'),
        conversationId: payload.conversationId,
        senderRole: 'me',
        senderName: req.user.name,
        content: payload.content.trim(),
        createdAt,
        isRead: true,
        deliveryStatus: 'Seen',
      };

      currentDatabase.messages.push(userMessage);

      let autoReply = null;

      if (conversation.autoReplies?.length) {
        const replyCursor = Number.isInteger(conversation.replyCursor) ? conversation.replyCursor : 0;
        const replyText = conversation.autoReplies[replyCursor % conversation.autoReplies.length];

        if (replyText) {
          autoReply = {
            id: createId('msg'),
            conversationId: payload.conversationId,
            senderRole: 'expert',
            senderName: conversation.participantName,
            content: replyText,
            createdAt: new Date(Date.now() + 1000).toISOString(),
            isRead: false,
            deliveryStatus: 'Delivered',
          };

          currentDatabase.messages.push(autoReply);
        }
      }

      currentDatabase.conversations = currentDatabase.conversations.map((item) =>
        item.id === payload.conversationId
          ? {
              ...item,
              isOnline: true,
              unreadCount: 0,
              replyCursor: item.autoReplies?.length
                ? ((Number.isInteger(item.replyCursor) ? item.replyCursor : 0) + 1) % item.autoReplies.length
                : 0,
              updatedAt: autoReply?.createdAt || createdAt,
            }
          : item,
      );

      const updatedConversation = currentDatabase.conversations.find(
        (item) => item.id === payload.conversationId,
      );

      responsePayload = {
        conversation: hydrateConversation(
          updatedConversation,
          currentDatabase.skills,
          currentDatabase.messages,
        ),
        messages: getConversationMessages(currentDatabase.messages, payload.conversationId),
      };

      return currentDatabase;
    });

    return res.status(201).json(responsePayload);
  } catch (error) {
    return next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const conversationId = req.body?.conversationId;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    const database = await updateDatabase((currentDatabase) => {
      currentDatabase.conversations = currentDatabase.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation,
      );

      return currentDatabase;
    });

    const updatedConversation = database.conversations.find((item) => item.id === conversationId);

    if (!updatedConversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.json(
      hydrateConversation(updatedConversation, database.skills, database.messages),
    );
  } catch (error) {
    return next(error);
  }
}

export async function deleteConversation(req, res, next) {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' });
    }

    await updateDatabase((currentDatabase) => {
      const conversationExists = currentDatabase.conversations.some(
        (conversation) => conversation.id === conversationId,
      );

      if (!conversationExists) {
        throw Object.assign(new Error('Conversation not found'), { status: 404 });
      }

      currentDatabase.conversations = currentDatabase.conversations.filter(
        (conversation) => conversation.id !== conversationId,
      );
      currentDatabase.messages = currentDatabase.messages.filter(
        (message) => message.conversationId !== conversationId,
      );

      return currentDatabase;
    });

    return res.json({
      success: true,
      conversationId,
    });
  } catch (error) {
    return next(error);
  }
}
