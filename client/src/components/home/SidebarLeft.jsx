import { Link } from 'react-router-dom';

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

export default function SidebarLeft({ user, stats }) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-blue-700 to-teal-600 text-sm font-bold text-white">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.role}</p>
          </div>
        </div>

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
