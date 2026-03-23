import { Link } from 'react-router-dom';
import SkillSection from './SkillSection';

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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-blue-700 to-teal-600 text-sm font-bold text-white transition group-hover:scale-[1.03]">
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
        <nav className="mt-4 space-y-2 text-sm font-semibold">
          <Link className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" to="/">
            Home
          </Link>
          <Link className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" to="/dashboard">
            My Skills
          </Link>
          <Link className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" to="/bookings">
            Bookings
          </Link>
          <Link className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100" to="/chat">
            Messages
          </Link>
        </nav>
      </div>
    </aside>
  );
}
