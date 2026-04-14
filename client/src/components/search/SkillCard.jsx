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

function ClockIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8V12L14.8 13.6" strokeLinecap="round" strokeLinejoin="round" />
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

export default function SkillCard({
  skill,
  isActive = false,
  onSelect,
  onBook,
  onChat,
  isBooking = false,
  isChatting = false,
}) {
  if (!skill) {
    return null;
  }

  const priceLabel = `${formatCurrency(skill.price, skill.currency)}${skill.priceType === 'monthly' ? ' / month' : ' / session'}`;
  const handleSelect = () => {
    if (typeof onSelect === 'function') {
      onSelect(skill);
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={`group overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md focus:outline-none ${
        isActive ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200/70'
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-base font-bold text-slate-700"
          >
            {skill.providerInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{skill.providerName}</p>
                <p className="mt-0.5 text-xs text-slate-500">{skill.category}</p>
              </div>

              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <StarIcon className="h-3.5 w-3.5" />
                {skill.rating.toFixed(1)}
              </div>
            </div>

            <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-950">
              {skill.title}
            </h3>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600 line-clamp-2">{skill.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Price</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">{priceLabel}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Mode</p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950">{skill.mode}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
            <MapPinIcon className="h-4 w-4" />
            {skill.location}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1">
            <ClockIcon className="h-4 w-4" />
            {skill.availability}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {skill.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChat?.(skill);
              }}
              disabled={isChatting}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label={`Chat with ${skill.providerName}`}
            >
              <ChatIcon className="h-4 w-4" />
              <span className="max-[399px]:hidden">{isChatting ? 'Opening...' : 'Chat'}</span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onBook?.(skill);
              }}
              disabled={isBooking}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label={`Book ${skill.title}`}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="max-[399px]:hidden">{isBooking ? 'Booking...' : 'Book'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
