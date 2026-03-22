import { DELIVERY_OPTIONS } from './searchHelpers';

function SparkIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z" />
    </svg>
  );
}

function CodeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M8 8L4 12L8 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8L20 12L16 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 5L10.5 19" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4H13.5A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M4 12H20" />
    </svg>
  );
}

function ActivityIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M4 13H8L10.5 8L13.5 16L16 11H20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MusicIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M14 5V15.2A2.8 2.8 0 1 1 12 12.55V7.4L19 5V12.2A2.8 2.8 0 1 1 17 9.55V5H14Z" />
    </svg>
  );
}

function HomeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M4 10.5L12 4L20 10.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.5V20H17.5V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CATEGORY_ICONS = {
  'digital-design': SparkIcon,
  'tech-coding': CodeIcon,
  'language-career': BriefcaseIcon,
  'fitness-wellness': ActivityIcon,
  'music-arts': MusicIcon,
  'home-daily-life': HomeIcon,
};

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedMode,
  onModeChange,
  maxDistance,
  onDistanceChange,
  onReset,
  onClose,
  isMobile = false,
}) {
  return (
    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Filters</p>
          <h2 className="mt-1.5 text-lg font-semibold text-slate-900">
            Refine your search
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
          >
            Reset
          </button>
          {isMobile ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Categories</p>
              <p className="text-xs text-slate-500">Choose the area you want to explore.</p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onCategoryChange('all')}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  selectedCategory === 'all' ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <SparkIcon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">All categories</span>
                <span className={`block text-xs ${selectedCategory === 'all' ? 'text-slate-200' : 'text-slate-500'}`}>
                  Browse the full marketplace.
                </span>
              </span>
            </button>

            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.id] || SparkIcon;
              const isActive = selectedCategory === category.label;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onCategoryChange(category.label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-200' : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{category.label}</span>
                    <span className={`block text-xs ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                      {category.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Delivery mode</p>
              <p className="text-xs text-slate-500">Switch between online, offline, and hybrid sessions.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DELIVERY_OPTIONS.map((option) => {
                const isActive = selectedMode === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onModeChange(option.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className={`mt-1 block text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Distance</p>
                <p className="text-xs text-slate-500">Show options within your preferred radius.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                Up to {maxDistance} km
              </span>
            </div>

            <input
              type="range"
              min="3"
              max="25"
              step="1"
              value={maxDistance}
              onChange={(event) => onDistanceChange(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 accent-blue-600"
            />

            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>3 km</span>
              <span>15 km</span>
              <span>25 km</span>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
