function SearchIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L16.65 16.65" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  onSuggestionSelect,
  recentSearches,
  suggestions,
  resultCount,
  activeFiltersCount,
}) {
  const visibleSuggestions = suggestions.slice(0, 6);
  const visibleRecents = recentSearches.slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(query);
        }}
        className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <SearchIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search skills like yoga, coding, design..."
              className="w-full min-w-0 border-none bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:px-5"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="max-[399px]:hidden">Search</span>
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {visibleRecents.length ? (
              <>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Recent
                </span>
                {visibleRecents.map((item) => (
                  <button
                    key={`recent-${item}`}
                    type="button"
                    onClick={() => onSuggestionSelect(item)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    {item}
                  </button>
                ))}
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Popular
                </span>
                {visibleSuggestions.map((item) => (
                  <button
                    key={`suggestion-${item}`}
                    type="button"
                    onClick={() => onSuggestionSelect(item)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    {item}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {resultCount} curated match{resultCount === 1 ? '' : 'es'}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {activeFiltersCount} active filter{activeFiltersCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
