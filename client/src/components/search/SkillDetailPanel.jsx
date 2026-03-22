import { formatCurrency } from './searchHelpers';

function StarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 3.75L14.62 9.06L20.48 9.91L16.24 14.04L17.24 19.87L12 17.12L6.76 19.87L7.76 14.04L3.52 9.91L9.38 9.06L12 3.75Z" />
    </svg>
  );
}

function MapPinIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 21C12 21 18 15.4 18 10.5A6 6 0 1 0 6 10.5C6 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </svg>
  );
}

function ChatIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M7 17L4 20V6.5A2.5 2.5 0 0 1 6.5 4H17.5A2.5 2.5 0 0 1 20 6.5V14.5A2.5 2.5 0 0 1 17.5 17H7Z" />
    </svg>
  );
}

function CalendarIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 3V7" strokeLinecap="round" />
      <path d="M16 3V7" strokeLinecap="round" />
      <path d="M4 10H20" />
    </svg>
  );
}

function DetailSkeleton() {
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="animate-pulse space-y-5">
        <div className="h-28 rounded-xl bg-slate-200" />
        <div className="h-6 w-2/3 rounded-full bg-slate-200" />
        <div className="h-4 w-full rounded-full bg-slate-200" />
        <div className="h-4 w-5/6 rounded-full bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
        </div>
        <div className="h-12 rounded-full bg-slate-200" />
        <div className="h-12 rounded-full bg-slate-200" />
      </div>
    </aside>
  );
}

export default function SkillDetailPanel({ skill, onBook, onChat, isBooking = false, loading = false }) {
  if (loading) {
    return <DetailSkeleton />;
  }

  if (!skill) {
    return null;
  }

  const metricCards = [
    { label: 'Price', value: `${formatCurrency(skill.price, skill.currency)} / session` },
    { label: 'Mode', value: skill.mode },
    { label: 'Availability', value: skill.availability },
    { label: 'Response', value: skill.responseTime },
  ];

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            {skill.category}
          </span>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <StarIcon className="h-3.5 w-3.5" />
            {skill.rating.toFixed(1)}
          </div>
        </div>

        <h2 className="mt-3 text-xl font-semibold leading-snug text-slate-900">
          {skill.title}
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-700">
            {skill.providerInitials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{skill.providerName}</p>
            <p className="text-sm text-slate-500">{skill.level}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-slate-600">
            <MapPinIcon className="h-4 w-4" />
            {skill.location}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-slate-600">
            <CalendarIcon className="h-4 w-4" />
            {skill.distanceLabel}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {metricCards.map((item) => (
          <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Overview</h3>
        <p className="mt-2.5 text-sm leading-6 text-slate-600">{skill.description}</p>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">What you get</h3>
          <span className="text-sm font-semibold text-slate-900">{skill.learnersHelped}+ learners helped</span>
        </div>

        <div className="mt-4 space-y-3">
          {skill.outcomes.length ? (
            skill.outcomes.map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              Practical, structured support tailored to the learner's goals.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {skill.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onBook(skill)}
          disabled={isBooking}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <CalendarIcon className="h-4 w-4" />
          {isBooking ? 'Booking...' : 'Book Now'}
        </button>

        <button
          type="button"
          onClick={() => onChat(skill)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ChatIcon className="h-4 w-4" />
          Chat
        </button>
      </div>
    </aside>
  );
}
