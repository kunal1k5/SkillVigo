import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Skill from '../models/Skill.js';
import { createId, readDatabase, updateDatabase } from '../data/dataStore.js';

const MAX_HOME_POSTS = 20;

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

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getDefaultHomePosts() {
  const now = Date.now();

  return [
    {
      id: 'home-post-101',
      user: {
        id: 'seed-provider-aanya',
        name: 'Aanya Singh',
        role: 'UI mentor',
        avatar: '',
      },
      text:
        'This week I opened two focused UI review slots for founders who want faster feedback on mobile onboarding.',
      image: '',
      likes: 12,
      likedBy: [],
      comments: [
        {
          id: 'home-comment-101',
          user: {
            id: 'seed-seeker-ravi',
            name: 'Ravi',
          },
          text: 'Can you also review the dashboard hierarchy?',
          createdAt: new Date(now - (1000 * 60 * 50)).toISOString(),
        },
      ],
      createdAt: new Date(now - (1000 * 60 * 90)).toISOString(),
    },
    {
      id: 'home-post-102',
      user: {
        id: 'seed-provider-kabir',
        name: 'Kabir Khan',
        role: 'Interview speaking coach',
        avatar: '',
      },
      text:
        'If you have an interview this week, share the role and I will help you prepare a tighter spoken intro.',
      image: '',
      likes: 18,
      likedBy: [],
      comments: [],
      createdAt: new Date(now - (1000 * 60 * 60 * 4)).toISOString(),
    },
    {
      id: 'home-post-103',
      user: {
        id: 'seed-skillvigo-team',
        name: 'SkillVigo Team',
        role: 'Community',
        avatar: '',
      },
      text:
        'Providers can now manage live requests from dashboard while seekers keep their booking flow separate and cleaner.',
      image: '',
      likes: 21,
      likedBy: [],
      comments: [],
      createdAt: new Date(now - (1000 * 60 * 60 * 10)).toISOString(),
    },
  ];
}

function ensureHomePosts(database) {
  const existingPosts = Array.isArray(database?.homePosts) ? database.homePosts : [];
  return existingPosts.length ? existingPosts : getDefaultHomePosts();
}

function buildProviderLabel(skill) {
  return normalizeString(skill?.title) || 'Skill provider';
}

function buildPostResponse(post) {
  return {
    id: post.id,
    user: {
      id: post.user?.id || '',
      name: post.user?.name || 'SkillVigo member',
      role: post.user?.role || 'Community member',
      avatar: post.user?.avatar || '',
    },
    text: normalizeString(post.text),
    image: normalizeString(post.image),
    likes: Number(post.likes || 0),
    likedBy: Array.isArray(post.likedBy) ? post.likedBy.filter(Boolean) : [],
    comments: Array.isArray(post.comments)
      ? post.comments.map((comment) => ({
          id: comment.id,
          user: {
            id: comment.user?.id || '',
            name: comment.user?.name || 'SkillVigo member',
          },
          text: normalizeString(comment.text),
          createdAt: comment.createdAt,
        }))
      : [],
    createdAt: post.createdAt,
  };
}

function buildSkillBookingMaps(skills, bookings, reviews) {
  const activeBookingsBySkill = new Map();
  const completedLearnersBySkill = new Map();
  const ratingBySkill = new Map();

  skills.forEach((skill) => {
    const skillId = normalizeObjectIdString(skill._id);
    const relatedBookings = bookings.filter(
      (booking) => normalizeObjectIdString(booking.skillId) === skillId,
    );
    const relatedReviews = reviews.filter((review) => review.skillId === skillId);
    const completedLearners = new Set(
      relatedBookings
        .filter((booking) => String(booking.status || '').toLowerCase() === 'completed')
        .map((booking) => normalizeObjectIdString(booking.studentId))
        .filter(Boolean),
    );
    const activeBookings = relatedBookings.filter((booking) =>
      ['pending', 'confirmed'].includes(String(booking.status || '').toLowerCase()),
    ).length;
    const rating = relatedReviews.length
      ? relatedReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / relatedReviews.length
      : Math.min(5, 4.2 + Math.min(Number(skill.experience || 0) * 0.05, 0.6));

    activeBookingsBySkill.set(skillId, activeBookings);
    completedLearnersBySkill.set(skillId, completedLearners.size);
    ratingBySkill.set(skillId, Number(rating.toFixed(1)));
  });

  return {
    activeBookingsBySkill,
    completedLearnersBySkill,
    ratingBySkill,
  };
}

function buildViewerStats({ user, skills, bookings, reviews }) {
  if (!user) {
    return {
      skills: skills.length,
      bookings: 0,
      rating: 0,
    };
  }

  const currentUserId = normalizeObjectIdString(user._id || user.id);

  if (user.role === 'provider') {
    const providerReviews = reviews.filter((review) => review.revieweeId === currentUserId);
    const providerBookings = bookings.filter(
      (booking) => normalizeObjectIdString(booking.instructorId) === currentUserId,
    );
    const averageRating = providerReviews.length
      ? providerReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / providerReviews.length
      : 0;

    return {
      skills: skills.filter((skill) => normalizeObjectIdString(skill.userId) === currentUserId).length,
      bookings: providerBookings.length,
      rating: Number(averageRating.toFixed(1)),
    };
  }

  const seekerBookings = bookings.filter(
    (booking) => normalizeObjectIdString(booking.studentId) === currentUserId,
  );
  const seekerReviews = reviews.filter((review) => review.reviewerId === currentUserId);
  const averageGivenRating = seekerReviews.length
    ? seekerReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / seekerReviews.length
    : 0;

  return {
    skills: new Set(
      seekerBookings.map((booking) => normalizeObjectIdString(booking.skillId)).filter(Boolean),
    ).size,
    bookings: seekerBookings.length,
    rating: Number(averageGivenRating.toFixed(1)),
  };
}

function buildViewerSkillHighlights({ user, skills, bookings }) {
  if (!user) {
    return skills.slice(0, 5).map((skill) => skill.title);
  }

  const currentUserId = normalizeObjectIdString(user._id || user.id);

  if (user.role === 'provider') {
    return skills
      .filter((skill) => normalizeObjectIdString(skill.userId) === currentUserId)
      .slice(0, 6)
      .map((skill) => skill.title);
  }

  const bookedSkillIds = new Set(
    bookings
      .filter((booking) => normalizeObjectIdString(booking.studentId) === currentUserId)
      .map((booking) => normalizeObjectIdString(booking.skillId))
      .filter(Boolean),
  );

  return skills
    .filter((skill) => bookedSkillIds.has(normalizeObjectIdString(skill._id)))
    .slice(0, 6)
    .map((skill) => skill.title);
}

function buildSuggestions({ user, skills, ratingBySkill }) {
  const currentUserId = normalizeObjectIdString(user?._id || user?.id);

  return skills
    .filter((skill) => normalizeObjectIdString(skill.userId?._id || skill.userId) !== currentUserId)
    .sort((first, second) => {
      const firstRating = ratingBySkill.get(normalizeObjectIdString(first._id)) || 0;
      const secondRating = ratingBySkill.get(normalizeObjectIdString(second._id)) || 0;
      return secondRating - firstRating;
    })
    .slice(0, 4)
    .map((skill) => ({
      id: normalizeObjectIdString(skill._id),
      name: skill.userId?.name || 'SkillVigo provider',
      role: buildProviderLabel(skill),
      location: skill.location || skill.userId?.location || 'Flexible',
      rate: `INR ${Number(skill.price || 0)}/session`,
      rating: ratingBySkill.get(normalizeObjectIdString(skill._id)) || 0,
    }));
}

function buildTrending({ skills, activeBookingsBySkill, completedLearnersBySkill }) {
  return skills
    .map((skill) => {
      const skillId = normalizeObjectIdString(skill._id);
      const activeBookings = activeBookingsBySkill.get(skillId) || 0;
      const learnersHelped = completedLearnersBySkill.get(skillId) || 0;

      return {
        id: `trend-${skillId}`,
        title: skill.title,
        score: activeBookings * 5 + learnersHelped,
        count:
          learnersHelped > 0
            ? `${learnersHelped}+ learners helped`
            : `${Math.max(activeBookings, 1)} active request${activeBookings === 1 ? '' : 's'}`,
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, 5)
    .map(({ id, title, count }) => ({
      id,
      title,
      count,
    }));
}

function buildViewerMeta(user) {
  if (!user) {
    return {
      isAuthenticated: false,
      role: 'guest',
      dashboardMode: 'guest',
      canCreatePost: false,
      canCreateSkill: false,
      canHireSkills: true,
    };
  }

  return {
    isAuthenticated: true,
    role: user.role,
    dashboardMode: user.role === 'provider' ? 'provider' : 'seeker',
    canCreatePost: user.role === 'provider' || user.role === 'admin',
    canCreateSkill: user.role === 'provider' || user.role === 'admin',
    canHireSkills: user.role !== 'provider',
  };
}

export async function getHomeFeed(req, res, next) {
  try {
    const [database, skills, bookings] = await Promise.all([
      readDatabase(),
      Skill.find()
        .populate('userId', 'name location role avatarUrl')
        .sort({ createdAt: -1 }),
      Booking.find({}).select('studentId instructorId skillId status'),
    ]);
    const reviews = Array.isArray(database?.reviews) ? database.reviews : [];
    const homePosts = ensureHomePosts(database)
      .map(buildPostResponse)
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
      .slice(0, MAX_HOME_POSTS);
    const {
      activeBookingsBySkill,
      completedLearnersBySkill,
      ratingBySkill,
    } = buildSkillBookingMaps(skills, bookings, reviews);

    return res.json({
      success: true,
      home: {
        viewer: buildViewerMeta(req.user || null),
        stats: buildViewerStats({
          user: req.user || null,
          skills,
          bookings,
          reviews,
        }),
        skills: buildViewerSkillHighlights({
          user: req.user || null,
          skills,
          bookings,
        }),
        posts: homePosts,
        suggestions: buildSuggestions({
          user: req.user || null,
          skills,
          ratingBySkill,
        }),
        trending: buildTrending({
          skills,
          activeBookingsBySkill,
          completedLearnersBySkill,
        }),
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createHomePost(req, res, next) {
  try {
    if (!['provider', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Only skill providers can create home feed posts.',
      });
    }

    const text = normalizeString(req.body?.text);
    const image = normalizeString(req.body?.image);

    if (!text && !image) {
      return res.status(400).json({
        error: 'text or image is required to create a post.',
      });
    }

    const skill = await Skill.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const createdPost = {
      id: createId('home-post'),
      user: {
        id: req.user.id,
        name: req.user.name,
        role: buildProviderLabel(skill),
        avatar: req.user.avatarUrl || '',
      },
      text,
      image,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    await updateDatabase((currentDatabase) => {
      currentDatabase.homePosts = [createdPost, ...ensureHomePosts(currentDatabase)].slice(0, MAX_HOME_POSTS);
      return currentDatabase;
    });

    return res.status(201).json({
      success: true,
      post: buildPostResponse(createdPost),
    });
  } catch (error) {
    return next(error);
  }
}

export async function toggleHomePostLike(req, res, next) {
  try {
    const currentUserId = req.user.id;
    let updatedPost = null;

    await updateDatabase((currentDatabase) => {
      const posts = ensureHomePosts(currentDatabase);
      currentDatabase.homePosts = posts.map((post) => {
        if (post.id !== req.params.postId) {
          return post;
        }

        const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
        const hasLiked = likedBy.includes(currentUserId);
        const nextLikedBy = hasLiked
          ? likedBy.filter((likedUserId) => likedUserId !== currentUserId)
          : [...likedBy, currentUserId];

        updatedPost = {
          ...post,
          likedBy: nextLikedBy,
          likes: nextLikedBy.length,
        };

        return updatedPost;
      });

      return currentDatabase;
    });

    if (!updatedPost) {
      return res.status(404).json({
        error: 'Post not found.',
      });
    }

    return res.json({
      success: true,
      post: buildPostResponse(updatedPost),
    });
  } catch (error) {
    return next(error);
  }
}

export async function addHomePostComment(req, res, next) {
  try {
    const text = normalizeString(req.body?.text);

    if (!text) {
      return res.status(400).json({
        error: 'text is required to add a comment.',
      });
    }

    const createdComment = {
      id: createId('home-comment'),
      user: {
        id: req.user.id,
        name: req.user.name,
      },
      text,
      createdAt: new Date().toISOString(),
    };

    let updatedPost = null;

    await updateDatabase((currentDatabase) => {
      const posts = ensureHomePosts(currentDatabase);
      currentDatabase.homePosts = posts.map((post) => {
        if (post.id !== req.params.postId) {
          return post;
        }

        updatedPost = {
          ...post,
          comments: [...(Array.isArray(post.comments) ? post.comments : []), createdComment],
        };

        return updatedPost;
      });

      return currentDatabase;
    });

    if (!updatedPost) {
      return res.status(404).json({
        error: 'Post not found.',
      });
    }

    return res.status(201).json({
      success: true,
      post: buildPostResponse(updatedPost),
      comment: createdComment,
    });
  } catch (error) {
    return next(error);
  }
}
