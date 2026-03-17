export default function SidebarRight({ suggestions, trending }) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Suggested Tutors</p>
          <span className="text-xs font-semibold text-slate-400">Local picks</span>
        </div>
        <div className="mt-4 space-y-3">
          {suggestions.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border border-slate-100 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
                  <p className="text-xs text-slate-500">{profile.role}</p>
                </div>
                <p className="text-xs font-semibold text-slate-500">{profile.rating} rating</p>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{profile.location}</span>
                <span className="font-semibold text-slate-700">{profile.rate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold text-slate-900">Trending Skills</p>
        <ul className="mt-4 space-y-3">
          {trending.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/90 px-4 py-3 text-sm text-slate-600"
            >
              <span className="font-semibold text-slate-800">{item.title}</span>
              <span className="text-xs font-semibold text-slate-400">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
