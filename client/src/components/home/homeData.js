export const homeStats = {
  skills: 12,
  bookings: 4,
  rating: 4.8,
};

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

export const feedPosts = [
  {
    id: 'post-1',
    author: {
      name: 'Aanya Kapoor',
      role: 'Math Tutor',
      avatar: '',
    },
    time: '2h ago',
    content:
      'I have two open slots this week for algebra and statistics. Happy to run a free 15-min intro call for new learners.',
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    likes: 24,
    comments: [
      { id: 'c-1', name: 'Dev Patel', text: 'Can you cover probability basics too?' },
      { id: 'c-2', name: 'Aanya Kapoor', text: 'Yes, I can add it to the lesson plan.' },
    ],
  },
  {
    id: 'post-2',
    author: {
      name: 'SkillVigo Team',
      role: 'Community',
      avatar: '',
    },
    time: '4h ago',
    content:
      'We just launched a new booking flow with smarter reminders. Try it out and share feedback with us.',
    image: '',
    likes: 58,
    comments: [
      { id: 'c-3', name: 'Riya Sharma', text: 'The reminder email looks great.' },
    ],
  },
  {
    id: 'post-3',
    author: {
      name: 'Arjun Mehta',
      role: 'Guitar Teacher',
      avatar: '',
    },
    time: '6h ago',
    content:
      'Weekend batch for acoustic basics is live. Bringing a friend gets you a bonus practice session.',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    likes: 33,
    comments: [
      { id: 'c-4', name: 'Neha Kulkarni', text: 'Do you also coach fingerstyle?' },
    ],
  },
  {
    id: 'post-4',
    author: {
      name: 'Neha Kulkarni',
      role: 'UI/UX Coach',
      avatar: '',
    },
    time: '1d ago',
    content:
      'New UI critique slots are open this Friday. Bring your portfolio and we can review it together.',
    image: '',
    likes: 41,
    comments: [
      { id: 'c-5', name: 'Karan Patel', text: 'Interested. Is it remote-friendly?' },
      { id: 'c-6', name: 'Neha Kulkarni', text: 'Yes, remote sessions are available.' },
    ],
  },
];

export const fetchHomeFeed = () =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        posts: feedPosts,
        stats: homeStats,
        suggestions: suggestedProfiles,
        trending: trendingSkills,
      });
    }, 800);
  });
