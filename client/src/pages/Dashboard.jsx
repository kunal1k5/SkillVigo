import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, CheckCircle, Activity, MessageSquare, Settings, Star, DollarSign, ListOrdered, Award, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import { getDashboardData } from '../services/dashboardService';
import { deleteSkill as deleteSkillRequest } from '../services/skillService';

const EMPTY_DASHBOARD_DATA = {
  stats: [],
  skills: [],
  bookings: [],
  activities: [],
  conversations: [],
};

const STUB_DATA = {
  provider: {
    stats: [
      { id: 1, title: 'Total Earnings', value: 'Rs 45,200', icon: 'RS' },
      { id: 2, title: 'Total Bookings', value: '124', icon: 'BK' },
      { id: 3, title: 'Active Services', value: '4', icon: 'SV' },
      { id: 4, title: 'Rating', value: '4.8', icon: 'RT' },
    ],
    skills: [
      { id: 1, name: 'Advanced React Development', price: 'Rs 1500/hr', active: true },
      { id: 2, name: 'UI/UX Design Mentorship', price: 'Rs 1200/hr', active: true },
      { id: 3, name: 'Node.js Backend Setup', price: 'Rs 2000/hr', active: false },
    ],
    bookings: [
      { id: 1, client: 'Rahul Verma', service: 'React Mentorship', date: '24 Mar, 2026', status: 'Upcoming' },
      { id: 2, client: 'Neha Sharma', service: 'UI Review Session', date: '20 Mar, 2026', status: 'Completed' },
      { id: 3, client: 'Amit Kumar', service: 'Backend Setup Call', date: '18 Mar, 2026', status: 'Completed' },
      { id: 4, client: 'Pooja Singh', service: 'Portfolio Feedback', date: '16 Mar, 2026', status: 'Cancelled' },
    ],
    activities: [
      { id: 1, message: 'New booking from Rahul for React Development', time: '2 hours ago' },
      { id: 2, message: 'You received a 5-star review', time: '1 day ago' },
      { id: 3, message: 'Payment of Rs 3000 deposited', time: '2 days ago' },
    ],
    conversations: [
      {
        id: '1',
        name: 'Rahul Verma',
        role: 'Student',
        lastMessage: 'Can we start at 5 PM today?',
        time: '10:30 AM',
        messages: [
          { id: 1, sender: 'them', text: 'Hi, I booked a React mentorship session.' },
          { id: 2, sender: 'me', text: 'Great, I have your booking on my dashboard.' },
          { id: 3, sender: 'them', text: 'Can we start at 5 PM today?' },
        ],
      },
      {
        id: '2',
        name: 'Neha Sharma',
        role: 'Founder',
        lastMessage: 'Thanks for the quick feedback.',
        time: 'Yesterday',
        messages: [
          { id: 1, sender: 'me', text: 'I shared the design review notes.' },
          { id: 2, sender: 'them', text: 'Thanks for the quick feedback.' },
        ],
      },
    ],
  },
  seeker: {
    stats: [
      { id: 1, title: 'Skills Learned', value: '12', icon: 'SK' },
      { id: 2, title: 'Total Bookings', value: '24', icon: 'BK' },
      { id: 3, title: 'Active Sessions', value: '2', icon: 'AC' },
      { id: 4, title: 'Given Reviews', value: '18', icon: 'RV' },
    ],
    bookings: [
      { id: 1, client: 'Kunal Singh', service: 'React Mentorship', date: '24 Mar, 2026', status: 'Upcoming' },
      { id: 2, client: 'Neha Sharma', service: 'UI/UX Design', date: '20 Mar, 2026', status: 'Completed' },
      { id: 3, client: 'Amit Kumar', service: 'Backend Node.js', date: '15 Mar, 2026', status: 'Completed' },
      { id: 4, client: 'Riya Patel', service: 'Interview Coaching', date: '10 Mar, 2026', status: 'Upcoming' },
    ],
    activities: [
      { id: 1, message: 'Reminder: Session with Kunal at 4 PM', time: '1 hour ago' },
      { id: 2, message: 'Neha approved your booking request', time: '5 hours ago' },
      { id: 3, message: 'You left a 5-star review for Amit', time: '1 week ago' },
    ],
    conversations: [
      {
        id: '1',
        name: 'Kunal Singh',
        role: 'React Mentor',
        lastMessage: 'Please share the topics you want to cover.',
        time: '09:45 AM',
        messages: [
          { id: 1, sender: 'me', text: 'I booked a React mentorship slot for tomorrow.' },
          { id: 2, sender: 'them', text: 'Please share the topics you want to cover.' },
        ],
      },
      {
        id: '2',
        name: 'Neha Sharma',
        role: 'UI/UX Designer',
        lastMessage: 'The latest mockups are ready.',
        time: 'Yesterday',
        messages: [
          { id: 1, sender: 'them', text: 'The latest mockups are ready.' },
          { id: 2, sender: 'me', text: 'I will review them before our next session.' },
        ],
      },
    ],
  },
};

const NAV_ITEMS = {
  dashboard: { label: 'Home', icon: 'DB' },         
  skills: { label: 'My Services', icon: 'SK' },    
  bookings: { label: 'Appointments', icon: 'BK' }, 
  messages: { label: 'Chats', icon: 'MS' },        
  settings: { label: 'Account Settings', icon: 'ST' }, 
};

function getInitials(name = '') {
  return (
    name
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'SV'
  );
}

function Sidebar({ user, activeNav, setActiveNav, isProvider }) {
  const navItems = [
    { id: 'dashboard', ...NAV_ITEMS.dashboard },
    ...(isProvider ? [{ id: 'skills', ...NAV_ITEMS.skills }] : []),
    { id: 'bookings', ...NAV_ITEMS.bookings },
    { id: 'messages', ...NAV_ITEMS.messages },
    { id: 'settings', ...NAV_ITEMS.settings },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-24 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col items-center text-center">
          <Link to={`/profile/${user?._id || user?.id || ''}`} className="inline-block transition hover:opacity-80">
            <div className="h-20 w-20 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
              {getInitials(user?.name)}
            </div>
            <h2 className="text-xl font-bold text-slate-800 hover:text-blue-600">{user?.name || 'User'}</h2>
          </Link>
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider mt-1 bg-blue-50 px-3 py-1 rounded-full">
            {user?.role || 'seeker'}
          </span>
        </div>

        <nav className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                activeNav === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatsCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </div>
  );
}

function SkillList({ skills, onDeleteSkill, deletingSkillId = '' }) {
  const skillItems = Array.isArray(skills) ? skills : [];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-500" /> My Skills
        </h2>
        <Link
          to="/create-skill"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
        >
          + Add New
        </Link>
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {skillItems.map((skill) => (
          <div
            key={skill.id}
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-slate-800">{skill.name}</h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-slate-600">{skill.price}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    skill.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {skill.active ? 'Active' : 'Draft'}
                </span>
              </div>
            </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteSkill?.(skill)}
                  disabled={deletingSkillId === skill.id}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  {deletingSkillId === skill.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

function BookingList({ bookings, title = 'Recent Bookings', role }) {
  const bookingItems = Array.isArray(bookings) ? bookings : [];
  const personLabel = role === 'provider' ? 'Client' : 'Provider';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg flex items-center gap-2 font-bold text-slate-800">
          <Calendar className="w-5 h-5 text-teal-500" /> {title}
        </h2>
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {bookingItems.map((booking) => (
          <div
            key={booking.id}
            className="p-4 flex flex-col gap-4 rounded-xl hover:bg-slate-50 transition-colors sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                {booking.client.charAt(0)}
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {personLabel}
                </p>
                <h3 className="font-semibold text-slate-800">{booking.client}</h3>
                <p className="text-sm text-slate-500">{booking.service}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <span className="text-sm font-medium text-slate-700">{booking.date}</span>
              <span
                className={`w-fit px-2 py-1 rounded text-xs font-semibold ${
                  booking.status === 'Completed'
                    ? 'bg-green-100 text-green-700'
                    : booking.status === 'Cancelled'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ activities }) {
  const activityItems = Array.isArray(activities) ? activities : [];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg flex items-center gap-2 font-bold text-slate-800">
          <Activity className="w-5 h-5 text-purple-500" /> Recent Activity
        </h2>
      </div>
      <div className="divide-y divide-slate-100 p-4">
        {activityItems.map((activity) => (
          <div key={activity.id} className="py-4 first:pt-2 last:pb-2 flex gap-4 items-start">
            <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-slate-800">{activity.message}</p>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageCenter({ conversations }) {
  const conversationItems = Array.isArray(conversations) ? conversations : [];
  const [activeId, setActiveId] = useState(conversationItems[0]?.id || '');
  const activeConversation =
    conversationItems.find((conversation) => conversation.id === activeId) || conversationItems[0];

  useEffect(() => {
    if (!activeId && conversationItems[0]?.id) {
      setActiveId(conversationItems[0].id);
    }
  }, [activeId, conversationItems]);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg flex items-center gap-2 font-bold text-slate-900">
            <MessageSquare className="w-5 h-5 text-indigo-500" /> Your Conversations
          </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {conversationItems.map((conversation) => (
              <button
              key={conversation.id}
              type="button"
              onClick={() => setActiveId(conversation.id)}
              className={`flex w-full items-start gap-3 px-5 py-4 text-left transition ${
                conversation.id === activeConversation?.id ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700">
                {conversation.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-slate-900">{conversation.name}</p>
                  <span className="text-xs text-slate-400">{conversation.time}</span>
                </div>
                <p className="text-xs font-medium text-blue-600">{conversation.role}</p>
                <p className="mt-1 truncate text-sm text-slate-500">{conversation.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <Link to="/chat" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View All Chats
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
        {activeConversation ? (
          <>
            <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{activeConversation.name}</h2>
                <p className="text-sm text-blue-600">{activeConversation.role}</p>
              </div>
              <Link
                to="/chat"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
              Continue Chat
              </Link>
            </div>
            <div className="space-y-4 bg-slate-50 p-6">
              {(activeConversation.messages || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      message.sender === 'me'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-800 border border-slate-100'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-slate-500">Start a conversation to see messages here.</div>
        )}
      </div>
    </div>
  );
}

function SettingsPanel({ currentUser, formData, onChange, onSubmit, saveMessage }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl flex items-center gap-2 font-bold text-slate-900">
          <Settings className="w-6 h-6 text-slate-600" /> Account Settings
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Update the profile details that appear around your SkillVigo account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Full Name</span>
          <input
            name="name"
            value={formData.name}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Phone</span>
          <input
            name="phone"
            value={formData.phone}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Location</span>
          <input
            name="location"
            value={formData.location}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </label>

        <label className="md:col-span-2 flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Bio</span>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </label>

        <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Signed in as <span className="font-semibold text-slate-700">{currentUser?.role || 'seeker'}</span>
          </div>
          <div className="flex items-center gap-3">
            {saveMessage ? <span className="text-sm font-medium text-green-600">{saveMessage}</span> : null}
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function DashboardOverview({
  currentUser,
  data,
  role,
  onDeleteSkill,
  deletingSkillId,
}) {
  return (
    <>
      <SectionHeader
        title={`Welcome back, ${currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}!`}
        description="Here is a quick summary of what is happening with your account today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.stats.map((stat) => (
          <StatsCard key={stat.id} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          {role === 'provider' ? (
            <SkillList
              skills={data.skills}
              onDeleteSkill={onDeleteSkill}
              deletingSkillId={deletingSkillId}
            />
          ) : (
            <BookingList bookings={data.bookings.slice(0, 3)} role={role} />
          )}
        </div>
        <div className="xl:col-span-1">
          <ActivityFeed activities={data.activities} />
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { currentUser, loading: authLoading, updateProfile } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD_DATA);
  const [loadError, setLoadError] = useState('');
  const [deletingSkillId, setDeletingSkillId] = useState('');

  const role = currentUser?.role === 'provider' ? 'provider' : 'seeker';
  const data = dashboardData || EMPTY_DASHBOARD_DATA;
  const isProvider = role === 'provider';

  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
  });

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      if (authLoading) {
        return;
      }

      if (!currentUser?.id) {
        if (!ignore) {
          setDashboardData(EMPTY_DASHBOARD_DATA);
          setLoadError('');
          setLoading(false);
        }
        return;
      }

      if (!ignore) {
        setLoading(true);
        setLoadError('');
      }

      try {
        const nextDashboard = await getDashboardData();

        if (!ignore) {
          setDashboardData({
            ...EMPTY_DASHBOARD_DATA,
            ...(nextDashboard || {}),
          });
        }
      } catch (error) {
        if (!ignore) {
          setDashboardData(EMPTY_DASHBOARD_DATA);
          setLoadError(error.message || 'Could not load your dashboard right now.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [authLoading, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    setSettingsForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      location: currentUser?.location || '',
      bio: currentUser?.bio || '',
    });
  }, [currentUser]);

  useEffect(() => {
    if (activeNav === 'skills' && !isProvider) {
      setActiveNav('dashboard');
    }
  }, [activeNav, isProvider]);

  const sectionMeta = useMemo(() => {
    const sectionTitles = {
      dashboard: {
        title: 'Dashboard',
        description: 'Your overview with stats, activity, and quick actions.',
      },
      skills: {
        title: 'My Skills',
        description: 'Manage the services and skills listed on your account.',
      },
      bookings: {
        title: 'Bookings',
        description: 'View all of your recent and upcoming bookings in one place.',
      },
      messages: {
        title: 'Messages',
        description: 'Open your recent conversations and jump into chat quickly.',
      },
      settings: {
        title: 'Settings',
        description: 'Adjust the profile details and contact information for your account.',
      },
    };

    return sectionTitles[activeNav] || sectionTitles.dashboard;
  }, [activeNav]);

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setSettingsForm((current) => ({
      ...current,
      [name]: value,
    }));
    setSaveMessage('');
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setSaveMessage('');

    if ((settingsForm.email || '').trim() !== (currentUser?.email || '').trim()) {
      window.alert('Email changes are not available from dashboard settings yet.');
      return;
    }

    try {
      await updateProfile({
        name: settingsForm.name,
        phone: settingsForm.phone,
        location: settingsForm.location,
        bio: settingsForm.bio,
      });
      setSaveMessage('Settings updated successfully.');
    } catch (error) {
      window.alert(error.message || 'Could not update your settings right now.');
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (!skill?.id || deletingSkillId) {
      return;
    }

    const confirmed = window.confirm(`Delete ${skill.name}?`);

    if (!confirmed) {
      return;
    }

    setDeletingSkillId(skill.id);

    try {
      await deleteSkillRequest(skill.id);
      setDashboardData((current) => ({
        ...current,
        skills: (current.skills || []).filter((item) => item.id !== skill.id),
      }));

      try {
        const nextDashboard = await getDashboardData();
        setDashboardData({
          ...EMPTY_DASHBOARD_DATA,
          ...(nextDashboard || {}),
        });
      } catch {
        // Keep the optimistic update if the silent refresh fails.
      }
    } catch (error) {
      window.alert(error.message || 'Could not delete this skill right now.');
    } finally {
      setDeletingSkillId('');
    }
  };

  const renderActiveSection = () => {
    switch (activeNav) {
      case 'skills':
        return (
          <SkillList
            skills={data.skills || []}
            onDeleteSkill={handleDeleteSkill}
            deletingSkillId={deletingSkillId}
          />
        );
      case 'bookings':
        return <BookingList bookings={data.bookings} role={role} title="All Recent Bookings" />;
      case 'messages':
        return <MessageCenter conversations={data.conversations} />;
      case 'settings':
        return (
          <SettingsPanel
            currentUser={currentUser}
            formData={settingsForm}
            onChange={handleSettingsChange}
            onSubmit={handleSettingsSubmit}
            saveMessage={saveMessage}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardOverview
            currentUser={currentUser}
            data={data}
            role={role}
            onDeleteSkill={handleDeleteSkill}
            deletingSkillId={deletingSkillId}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <PageContainer className="flex-1 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Sidebar
            user={currentUser}
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            isProvider={isProvider}
          />

          <main className="flex-1 flex flex-col gap-8 min-w-0">
            {authLoading || loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              </div>
            ) : activeNav === 'dashboard' ? (
              <>
                {loadError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
                    {loadError}
                  </div>
                ) : null}
                <DashboardOverview
                  currentUser={currentUser}
                  data={data}
                  role={role}
                  onDeleteSkill={handleDeleteSkill}
                  deletingSkillId={deletingSkillId}
                />
              </>
            ) : (
              <>
                {loadError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
                    {loadError}
                  </div>
                ) : null}
                <SectionHeader title={sectionMeta.title} description={sectionMeta.description} />
                {renderActiveSection()}
              </>
            )}
          </main>
        </div>
      </PageContainer>

      <Footer />
    </div>
  );
}
