const HOME_STORAGE_KEY = 'skillvigo-home-state-v1';
const HOME_USER_ID_KEY = 'skillvigo-demo-user-id-v1';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSkills(skills = []) {
  const seen = new Set();

  return skills
    .map((skill) => `${skill || ''}`.trim())
    .filter(Boolean)
    .filter((skill) => {
      const normalized = skill.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

function normalizeComment(comment = {}) {
  return {
    id: comment.id || createId('comment'),
    user: {
      id: comment.user?.id || comment.userId || createId('user'),
      name: comment.user?.name || comment.name || 'SkillVigo member',
    },
    text: `${comment.text || ''}`.trim(),
    createdAt: comment.createdAt || new Date().toISOString(),
  };
}

function normalizePost(post = {}) {
  const likedBy = Array.isArray(post.likedBy) ? post.likedBy.filter(Boolean) : [];

  return {
    id: post.id || createId('post'),
    user: {
      id: post.user?.id || post.author?.id || createId('user'),
      name: post.user?.name || post.author?.name || 'SkillVigo member',
      role: post.user?.role || post.author?.role || 'Community member',
      avatar: post.user?.avatar || post.author?.avatar || '',
    },
    text: `${post.text ?? post.content ?? ''}`.trim(),
    image: post.image || '',
    likes: typeof post.likes === 'number' ? post.likes : likedBy.length,
    likedBy,
    comments: Array.isArray(post.comments) ? post.comments.map(normalizeComment) : [],
    createdAt: post.createdAt || post.time || new Date().toISOString(),
  };
}

function getPersistentUserId(currentUser) {
  const authUserId = currentUser?.id || currentUser?._id;

  if (authUserId) {
    return authUserId;
  }

  const storage = getStorage();

  if (!storage) {
    return 'skillvigo-demo-user';
  }

  const storedUserId = storage.getItem(HOME_USER_ID_KEY);

  if (storedUserId) {
    return storedUserId;
  }

  return 'skillvigo-demo-user';
}

export function buildUserProfile(currentUser) {
  return {
    id: getPersistentUserId(currentUser),
    name: currentUser?.name || 'Guest Explorer',
    role: currentUser?.role ? `${currentUser.role} account` : 'SkillVigo member',
    avatar: currentUser?.avatar || '',
  };
}

export function getStoredHomeState({ defaultPosts = [], defaultSkills = [] }) {
  const storage = getStorage();
  const fallbackState = {
    posts: defaultPosts.map(normalizePost),
    skills: normalizeSkills(defaultSkills),
  };

  if (!storage) {
    return fallbackState;
  }

  try {
    const rawState = storage.getItem(HOME_STORAGE_KEY);

    if (!rawState) {
      return fallbackState;
    }

    const parsedState = JSON.parse(rawState);

    return {
      posts:
        Array.isArray(parsedState?.posts) && parsedState.posts.length
          ? parsedState.posts.map(normalizePost)
          : fallbackState.posts,
      skills:
        Array.isArray(parsedState?.skills) && parsedState.skills.length
          ? normalizeSkills(parsedState.skills)
          : fallbackState.skills,
    };
  } catch {
    return fallbackState;
  }
}

export function saveHomeState(state) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(
    HOME_STORAGE_KEY,
    JSON.stringify({
      posts: state.posts,
      skills: state.skills,
    }),
  );
}

export function createPost({ user, text, image }) {
  return normalizePost({
    id: createId('post'),
    user,
    text,
    image,
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString(),
  });
}

export function createComment({ user, text }) {
  return normalizeComment({
    id: createId('comment'),
    user: {
      id: user.id,
      name: user.name,
    },
    text,
    createdAt: new Date().toISOString(),
  });
}

export function toggleLikeOnPost(post, userId) {
  const hasLiked = post.likedBy.includes(userId);
  const currentLikes = Math.max(post.likes || 0, post.likedBy.length);

  return {
    ...post,
    likedBy: hasLiked
      ? post.likedBy.filter((likedUserId) => likedUserId !== userId)
      : [...post.likedBy, userId],
    likes: hasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
  };
}

export function formatRelativeTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' && value ? value : 'Just now';
  }

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
}

export function createShareLink(postId) {
  if (typeof window === 'undefined') {
    return `#${postId}`;
  }

  return `${window.location.origin}${window.location.pathname}#${postId}`;
}
