import { Link } from 'react-router-dom';
import SkillSection from './SkillSection';

function HomeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 10.5L12 4L20 10.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.5V20H17.5V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkillsIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
    </svg>
  );
}

function BookingIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3V7" strokeLinecap="round" />
      <path d="M16 3V7" strokeLinecap="round" />
      <path d="M4 10H20" />
    </svg>
  );
}

function MessageIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M7 17L4 20V6.5A2.5 2.5 0 0 1 6.5 4H17.5A2.5 2.5 0 0 1 20 6.5V14.5A2.5 2.5 0 0 1 17.5 17H7Z" />
    </svg>
  );
}

function getInitials(name = '') {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'SV';
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

export default function SidebarLeft({ user, stats, skills, onAddSkill }) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-soft backdrop-blur">
        <Link
          to="/profile"
          className="group flex items-center gap-4 rounded-2xl transition hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Open ${user.name} profile details`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-700 to-teal-600 text-sm font-bold text-white transition group-hover:scale-[1.03]">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900 transition group-hover:text-blue-700">
              {user.name}
            </p>
            <p className="text-sm text-slate-500">{user.role}</p>
          </div>
        </Link>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Skills</p>
            <p className="text-lg font-bold text-slate-900">{stats.skills}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Bookings</p>
            <p className="text-lg font-bold text-slate-900">{stats.bookings}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Rating</p>
            <p className="text-lg font-bold text-slate-900">{stats.rating}</p>
          </div>
        </div>
      </div>

      <SkillSection skills={skills} onAddSkill={onAddSkill} />

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Navigation</p>
        <nav className="mt-4 space-y-1.5">
          <Link className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900" to="/">
            <HomeIcon className="h-4 w-4 text-slate-400" />
            Home
          </Link>
          <Link className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900" to="/dashboard">
            <SkillsIcon className="h-4 w-4 text-slate-400" />
            My Skills
          </Link>
          <Link className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900" to="/bookings">
            <BookingIcon className="h-4 w-4 text-slate-400" />
            Bookings
          </Link>
          <Link className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900" to="/chat">
            <MessageIcon className="h-4 w-4 text-slate-400" />
            Messages
          </Link>
        </nav>
      </div>
    </aside>
  );
}
