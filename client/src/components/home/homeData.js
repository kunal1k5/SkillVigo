function getRelativeIso({ days = 0, hours = 0, minutes = 0 }) {
  const totalMinutes = (days * 24 * 60) + (hours * 60) + minutes;
  return new Date(Date.now() - totalMinutes * 60 * 1000).toISOString();
}

export const homeStats = {
  bookings: 4,
  rating: 4.8,
};

export const defaultSkills = ['Algebra', 'Python Mentoring', 'UX Portfolio Reviews'];

export const suggestedProfiles = [
  {
    id: 'suggest-1',
    name: 'Riya Sharma',
    role: 'Math Tutor',
    location: 'Andheri West',
    rate: 'INR 600/hr',
    rating: 4.9,
  },
  {
    id: 'suggest-2',
    name: 'Arjun Mehta',
    role: 'Guitar Teacher',
    location: 'Bandra',
    rate: 'INR 750/hr',
    rating: 4.7,
  },
  {
    id: 'suggest-3',
    name: 'Neha Kulkarni',
    role: 'UI/UX Coach',
    location: 'Powai',
    rate: 'INR 900/hr',
    rating: 4.8,
  },
  {
    id: 'suggest-4',
    name: 'Karan Patel',
    role: 'Fitness Trainer',
    location: 'Juhu',
    rate: 'INR 500/hr',
    rating: 4.6,
  },
];

export const trendingSkills = [
  { id: 'trend-1', title: 'Math Tutor', count: '1.2k learners' },
  { id: 'trend-2', title: 'Guitar Teacher', count: '980 learners' },
  { id: 'trend-3', title: 'Python Mentor', count: '860 learners' },
  { id: 'trend-4', title: 'Yoga Coach', count: '730 learners' },
  { id: 'trend-5', title: 'Graphic Design', count: '640 learners' },
];

export const defaultFeedPosts = [
  {
    id: 'post-1',
    user: {
      id: 'user-aanya-kapoor',
      name: 'Aanya Kapoor',
      role: 'Math Tutor',
      avatar: '',
    },
    text:
      'I have two open slots this week for algebra and statistics. Happy to run a free 15-min intro call for new learners.',
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    likes: 24,
    likedBy: [],
    comments: [
      {
        id: 'c-1',
        user: { id: 'user-dev-patel', name: 'Dev Patel' },
        text: 'Can you cover probability basics too?',
        createdAt: getRelativeIso({ hours: 1, minutes: 18 }),
      },
      {
        id: 'c-2',
        user: { id: 'user-aanya-kapoor', name: 'Aanya Kapoor' },
        text: 'Yes, I can add it to the lesson plan.',
        createdAt: getRelativeIso({ hours: 1, minutes: 8 }),
      },
    ],
    createdAt: getRelativeIso({ hours: 2 }),
  },
  {
    id: 'post-2',
    user: {
      id: 'user-skillvigo-team',
      name: 'SkillVigo Team',
      role: 'Community',
      avatar: '',
    },
    text:
      'We just launched a new booking flow with smarter reminders. Try it out and share feedback with us.',
    image: '',
    likes: 58,
    likedBy: [],
    comments: [
      {
        id: 'c-3',
        user: { id: 'user-riya-sharma', name: 'Riya Sharma' },
        text: 'The reminder email looks great.',
        createdAt: getRelativeIso({ hours: 3, minutes: 22 }),
      },
    ],
    createdAt: getRelativeIso({ hours: 4 }),
  },
  {
    id: 'post-3',
    user: {
      id: 'user-arjun-mehta',
      name: 'Arjun Mehta',
      role: 'Guitar Teacher',
      avatar: '',
    },
    text:
      'Weekend batch for acoustic basics is live. Bringing a friend gets you a bonus practice session.',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    likes: 33,
    likedBy: [],
    comments: [
      {
        id: 'c-4',
        user: { id: 'user-neha-kulkarni', name: 'Neha Kulkarni' },
        text: 'Do you also coach fingerstyle?',
        createdAt: getRelativeIso({ hours: 5, minutes: 26 }),
      },
    ],
    createdAt: getRelativeIso({ hours: 6 }),
  },
  {
    id: 'post-4',
    user: {
      id: 'user-neha-kulkarni',
      name: 'Neha Kulkarni',
      role: 'UI/UX Coach',
      avatar: '',
    },
    text:
      'New UI critique slots are open this Friday. Bring your portfolio and we can review it together.',
    image: '',
    likes: 41,
    likedBy: [],
    comments: [
      {
        id: 'c-5',
        user: { id: 'user-karan-patel', name: 'Karan Patel' },
        text: 'Interested. Is it remote-friendly?',
        createdAt: getRelativeIso({ hours: 23, minutes: 5 }),
      },
      {
        id: 'c-6',
        user: { id: 'user-neha-kulkarni', name: 'Neha Kulkarni' },
        text: 'Yes, remote sessions are available.',
        createdAt: getRelativeIso({ hours: 22, minutes: 43 }),
      },
    ],
    createdAt: getRelativeIso({ days: 1 }),
  },
];

export const feedPosts = defaultFeedPosts;
