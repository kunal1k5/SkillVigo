import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Skill from '../models/Skill.js';
import { readDatabase } from '../data/dataStore.js';

const BOOKING_POPULATE = [
  {
    path: 'skillId',
    select: 'title price category location',
  },
  {
    path: 'studentId',
    select: 'name',
  },
  {
    path: 'instructorId',
    select: 'name role',
  },
];

const CONVERSATION_POPULATE = [
  {
    path: 'participants',
    select: 'name role',
  },
  {
    path: 'skillId',
    select: 'title',
  },
];

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

function formatCurrency(amount = 0, currency = 'INR') {
  const numericAmount = Number(amount || 0);

  if (currency === 'INR') {
    return `Rs ${numericAmount.toLocaleString('en-IN')}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

function formatDashboardDate(value) {
  if (!value) {
    return 'Date TBD';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatConversationTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isSameDay) {
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

function formatRelativeTime(value) {
  if (!value) {
    return 'Just now';
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  if (diffHours < 48) {
    return '1 day ago';
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return formatDashboardDate(value);
}

function mapBookingStatus(status = '') {
  switch (String(status || '').toLowerCase()) {
    case 'completed':
      return 'Completed';
    case 'canceled':
      return 'Cancelled';
    default:
      return 'Upcoming';
  }
}

function getOtherParticipant(conversation, currentUserId) {
  const currentUserIdString = normalizeObjectIdString(currentUserId);
  return (conversation.participants || []).find(
    (participant) => normalizeObjectIdString(participant) !== currentUserIdString,
  );
}

function buildConversationRoleLabel(participant, skill) {
  if (skill?.title && participant?.role === 'provider') {
    return `Provider | ${skill.title}`;
  }

  if (skill?.title) {
    return skill.title;
  }

  if (!participant?.role) {
    return 'Conversation';
  }

  return participant.role.charAt(0).toUpperCase() + participant.role.slice(1);
}

function buildProviderStats({ skills, bookings, reviews }) {
  const completedBookings = bookings.filter((booking) => booking.status === 'completed');
  const totalEarnings = completedBookings.reduce(
    (sum, booking) => sum + Number(booking.price || booking.skillId?.price || 0),
    0,
  );
  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  const averageRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : '0.0';

  return [
    { id: 1, title: 'Total Earnings', value: formatCurrency(totalEarnings), icon: 'RS' },
    { id: 2, title: 'Total Bookings', value: String(bookings.length), icon: 'BK' },
    { id: 3, title: 'Active Services', value: String(skills.length), icon: 'SV' },
    { id: 4, title: 'Rating', value: averageRating, icon: 'RT' },
  ];
}

function buildSeekerStats({ bookings, reviews }) {
  const learnedSkills = new Set(
    bookings
      .filter((booking) => booking.status === 'completed')
      .map((booking) => normalizeObjectIdString(booking.skillId))
      .filter(Boolean),
  ).size;
  const activeSessions = bookings.filter((booking) =>
    ['pending', 'confirmed'].includes(String(booking.status || '').toLowerCase()),
  ).length;

  return [
    { id: 1, title: 'Skills Learned', value: String(learnedSkills), icon: 'SK' },
    { id: 2, title: 'Total Bookings', value: String(bookings.length), icon: 'BK' },
    { id: 3, title: 'Active Sessions', value: String(activeSessions), icon: 'AC' },
    { id: 4, title: 'Given Reviews', value: String(reviews.length), icon: 'RV' },
  ];
}

function buildSkillItems(skills) {
  return skills.map((skill, index) => ({
    id: normalizeObjectIdString(skill._id),
    name: skill.title,
    price: `${formatCurrency(skill.price)}/session`,
    active: true,
    order: index,
  }));
}

function buildBookingItems(bookings, role) {
  return bookings.map((booking) => {
    const counterpart =
      role === 'provider'
        ? booking.studentId?.name || 'Learner'
        : booking.instructorId?.name || 'Provider';

    return {
      id: normalizeObjectIdString(booking._id),
      client: counterpart,
      service: booking.skillId?.title || 'Skill session',
      date: formatDashboardDate(booking.scheduledAt || booking.createdAt),
      status: mapBookingStatus(booking.status),
      createdAt: booking.createdAt,
      scheduledAt: booking.scheduledAt,
    };
  });
}

function buildConversationItems(conversations, messagesByConversation, currentUserId) {
  return conversations.map((conversation) => {
    const otherParticipant = getOtherParticipant(conversation, currentUserId);
    const messages = (messagesByConversation.get(normalizeObjectIdString(conversation._id)) || [])
      .slice(-6)
      .map((message) => ({
        id: normalizeObjectIdString(message._id),
        sender:
          normalizeObjectIdString(message.senderId) === normalizeObjectIdString(currentUserId)
            ? 'me'
            : 'them',
        text: message.content,
      }));

    return {
      id: normalizeObjectIdString(conversation._id),
      name: otherParticipant?.name || 'SkillVigo member',
      role: buildConversationRoleLabel(otherParticipant, conversation.skillId),
      lastMessage: conversation.lastMessageText || 'No messages yet.',
      time: formatConversationTime(conversation.lastMessageAt || conversation.updatedAt),
      messages,
      lastMessageAt: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt,
    };
  });
}

function buildReviewEvents(reviews, role) {
  return reviews.map((review, index) => ({
    id: `review-${index}-${review.id || review.createdAt || Date.now()}`,
    message:
      role === 'provider'
        ? `You received a ${Number(review.rating || 0)}-star review.`
        : `You left a ${Number(review.rating || 0)}-star review.`,
    date: review.updatedAt || review.createdAt,
  }));
}

function buildSkillEvents(skills) {
  return skills.slice(0, 3).map((skill) => ({
    id: `skill-${normalizeObjectIdString(skill._id)}`,
    message: `You listed ${skill.title}.`,
    date: skill.createdAt,
  }));
}

function buildBookingEvents(bookings, role) {
  return bookings.slice(0, 5).map((booking) => {
    const skillTitle = booking.skillId?.title || 'Skill session';
    const studentName = booking.studentId?.name || 'Learner';
    const providerName = booking.instructorId?.name || 'Provider';
    const bookingStatus = String(booking.status || '').toLowerCase();

    let message = '';

    if (role === 'provider') {
      if (bookingStatus === 'pending') {
        message = `New booking from ${studentName} for ${skillTitle}.`;
      } else if (bookingStatus === 'confirmed') {
        message = `${studentName}'s booking for ${skillTitle} is confirmed.`;
      } else if (bookingStatus === 'completed') {
        message = `${skillTitle} with ${studentName} was completed.`;
      } else {
        message = `${studentName}'s booking for ${skillTitle} was cancelled.`;
      }
    } else if (bookingStatus === 'pending') {
      message = `Booking request sent to ${providerName} for ${skillTitle}.`;
    } else if (bookingStatus === 'confirmed') {
      message = `${providerName} confirmed your ${skillTitle} booking.`;
    } else if (bookingStatus === 'completed') {
      message = `${skillTitle} session with ${providerName} is completed.`;
    } else {
      message = `${skillTitle} booking with ${providerName} was cancelled.`;
    }

    return {
      id: `booking-${normalizeObjectIdString(booking._id)}`,
      message,
      date: booking.updatedAt || booking.createdAt,
    };
  });
}

function buildConversationEvents(conversations, currentUserId) {
  return conversations.slice(0, 4).map((conversation) => {
    const otherParticipant = getOtherParticipant(conversation, currentUserId);
    return {
      id: `conversation-${normalizeObjectIdString(conversation._id)}`,
      message: `New message from ${otherParticipant?.name || 'SkillVigo member'}.`,
      date: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt,
    };
  });
}

function buildActivities({
  role,
  skills,
  bookings,
  conversations,
  reviews,
  currentUserId,
}) {
  const events = [
    ...buildBookingEvents(bookings, role),
    ...buildConversationEvents(conversations, currentUserId),
    ...buildReviewEvents(reviews, role),
    ...(role === 'provider' ? buildSkillEvents(skills) : []),
  ]
    .filter((item) => item.message && item.date)
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
    .slice(0, 6)
    .map((item) => ({
      id: item.id,
      message: item.message,
      time: formatRelativeTime(item.date),
    }));

  if (events.length) {
    return events;
  }

  return [
    {
      id: 'welcome-activity',
      message: 'Your dashboard is ready. Start by creating a skill or booking a session.',
      time: 'Just now',
    },
  ];
}

function groupMessagesByConversation(messages) {
  const groupedMessages = new Map();

  messages.forEach((message) => {
    const conversationId = normalizeObjectIdString(message.conversationId);
    const list = groupedMessages.get(conversationId) || [];
    list.push(message);
    groupedMessages.set(conversationId, list);
  });

  return groupedMessages;
}

export async function getDashboard(req, res, next) {
  try {
    const currentUserId = normalizeObjectIdString(req.user._id || req.user.id);
    const isProvider = req.user.role === 'provider';
    const bookingQuery = isProvider
      ? { instructorId: req.user._id }
      : { studentId: req.user._id };

    const [skills, bookings, conversations, database] = await Promise.all([
      isProvider
        ? Skill.find({ userId: req.user._id }).sort({ createdAt: -1 })
        : Promise.resolve([]),
      Booking.find(bookingQuery)
        .populate(BOOKING_POPULATE)
        .sort({ scheduledAt: -1, createdAt: -1 }),
      Conversation.find({
        participants: req.user._id,
        deletedFor: { $ne: req.user._id },
      })
        .populate(CONVERSATION_POPULATE)
        .sort({ lastMessageAt: -1, updatedAt: -1, createdAt: -1 })
        .limit(6),
      readDatabase(),
    ]);

    const conversationIds = conversations.map((conversation) => conversation._id);
    const messages = conversationIds.length
      ? await Message.find({ conversationId: { $in: conversationIds } })
          .populate('senderId', 'name')
          .sort({ createdAt: 1 })
      : [];
    const messagesByConversation = groupMessagesByConversation(messages);
    const reviews = (database.reviews || []).filter((review) =>
      isProvider
        ? review.revieweeId === currentUserId
        : review.reviewerId === currentUserId,
    );

    const dashboard = {
      role: req.user.role,
      viewer: {
        role: req.user.role,
        mode: isProvider ? 'provider' : 'seeker',
        canCreateSkill: isProvider || req.user.role === 'admin',
        canCreateBooking: !isProvider,
      },
      summary: {
        totalSkills: skills.length,
        totalBookings: bookings.length,
        totalConversations: conversations.length,
        totalReviews: reviews.length,
      },
      stats: isProvider
        ? buildProviderStats({ skills, bookings, reviews })
        : buildSeekerStats({ bookings, reviews }),
      skills: isProvider ? buildSkillItems(skills) : [],
      bookings: buildBookingItems(bookings, req.user.role),
      activities: buildActivities({
        role: req.user.role,
        skills,
        bookings,
        conversations,
        reviews,
        currentUserId,
      }),
      conversations: buildConversationItems(conversations, messagesByConversation, currentUserId),
    };

    return res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    return next(error);
  }
}
