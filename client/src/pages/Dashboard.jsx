import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';

// --- DUMMY DATA ---
const STUB_DATA = {
  provider: {
    stats: [
      { id: 1, title: 'Total Earnings', value: '₹45,200', icon: '💰' },
      { id: 2, title: 'Total Bookings', value: '124', icon: '📅' },
      { id: 3, title: 'Active Services', value: '4', icon: '🚀' },
      { id: 4, title: 'Rating', value: '4.8', icon: '⭐' },
    ],
    skills: [
      { id: 1, name: 'Advanced React Development', price: '₹1500/hr', active: true },
      { id: 2, name: 'UI/UX Design Mentorship', price: '₹1200/hr', active: true },
      { id: 3, name: 'Node.js Backend Setup', price: '₹2000/hr', active: false },
    ],
    activities: [
      { id: 1, message: 'New booking from Rahul for React Development', time: '2 hours ago' },
      { id: 2, message: 'You received a 5-star review', time: '1 day ago' },
      { id: 3, message: 'Payment of ₹3000 deposited', time: '2 days ago' },
    ]
  },
  seeker: {
    stats: [
      { id: 1, title: 'Skills Learned', value: '12', icon: '🎯' },
      { id: 2, title: 'Total Bookings', value: '24', icon: '📅' },
      { id: 3, title: 'Active Sessions', value: '2', icon: '🚀' },
      { id: 4, title: 'Given Reviews', value: '18', icon: '⭐' },
    ],
    bookings: [
      { id: 1, provider: 'Kunal Singh', service: 'React Mentorship', date: '24 Oct, 2026', status: 'Upcoming' },
      { id: 2, provider: 'Neha Sharma', service: 'UI/UX Design', date: '20 Oct, 2026', status: 'Completed' },
      { id: 3, provider: 'Amit Kumar', service: 'Backend Node.js', date: '15 Oct, 2026', status: 'Completed' },
    ],
    activities: [
      { id: 1, message: 'Reminder: Session with Kunal at 4 PM', time: '1 hour ago' },
      { id: 2, message: 'Neha approved your booking request', time: '5 hours ago' },
      { id: 3, message: 'You left a 5-star review for Amit', time: '1 week ago' },
    ]
  }
};

// --- COMPONENTS ---

const Sidebar = ({ user, activeNav, setActiveNav }) => {
  const isProvider = user?.role === 'provider';
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    ...(isProvider ? [{ id: 'skills', label: 'My Skills', icon: '🛠️' }] : []),
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '✉️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-24 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user?.name || 'User'}</h2>
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider mt-1 bg-blue-50 px-3 py-1 rounded-full">
            {user?.role || 'Seeker'}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                activeNav === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

const StatsCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1 hover:shadow-lg">
    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
  </div>
);

const SkillList = ({ skills }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
      <h2 className="text-lg font-bold text-slate-800">My Skills</h2>
      <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
        + Add New
      </button>
    </div>
    <div className="divide-y divide-slate-100 p-2">
      {skills.map((skill) => (
        <div key={skill.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-slate-800">{skill.name}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-slate-600">{skill.price}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${skill.active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                {skill.active ? 'Active' : 'Draft'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">Edit</button>
            <button className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BookingList = ({ bookings }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
      <h2 className="text-lg font-bold text-slate-800">Recent Bookings</h2>
    </div>
    <div className="divide-y divide-slate-100 p-2">
      {bookings.map((booking) => (
        <div key={booking.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
              {booking.provider.charAt(0)}
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-slate-800">{booking.provider}</h3>
              <p className="text-sm text-slate-500">{booking.service}</p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <span className="text-sm font-medium text-slate-700">{booking.date}</span>
            <span className={`w-fit px-2 py-1 rounded text-xs font-semibold ${
              booking.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {booking.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ActivityFeed = ({ activities }) => (
  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
      <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
    </div>
    <div className="divide-y divide-slate-100 p-4">
      {activities.map((activity) => (
        <div key={activity.id} className="py-4 first:pt-2 last:pb-2 flex gap-4 items-start">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-800">{activity.message}</p>
            <span className="text-xs text-slate-500">{activity.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN DASHBOARD PAGE ---

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Determine user role (fallback to seeker if undefined)
  const role = currentUser?.role === 'provider' ? 'provider' : 'seeker';
  const data = STUB_DATA[role];

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [role]);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />

      <PageContainer className="flex-1 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT SIDEBAR */}
          <Sidebar user={currentUser} activeNav={activeNav} setActiveNav={setActiveNav} />
          
          {/* RIGHT MAIN CONTENT */}
          <main className="flex-1 flex flex-col gap-8 min-w-0">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Header Welcome */}
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome back, {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}! 👋
                  </h1>
                  <p className="text-slate-500 mt-2">Here's what's happening with your account today.</p>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.stats.map(stat => (
                    <StatsCard key={stat.id} title={stat.title} value={stat.value} icon={stat.icon} />
                  ))}
                </div>

                {/* Middle Section: Role-based Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {role === 'provider' ? (
                      <SkillList skills={data.skills} />
                    ) : (
                      <BookingList bookings={data.bookings} />
                    )}
                  </div>
                  
                  {/* Bottom/Side Section: Activity */}
                  <div className="lg:col-span-1">
                    <ActivityFeed activities={data.activities} />
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </PageContainer>

      <Footer />
    </div>
  );
}
