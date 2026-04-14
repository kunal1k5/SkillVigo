import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/search/FilterSidebar';
import SearchBar from '../components/search/SearchBar';
import SearchResultsSkeleton from '../components/search/SearchResultsSkeleton';
import SkillCard from '../components/search/SkillCard';
import SkillDetailPanel from '../components/search/SkillDetailPanel';
import {
  DEFAULT_MAX_DISTANCE,
  SORT_OPTIONS,
  buildSearchHaystack,
  normalizeSkill,
  readRecentSearches,
  sortSkills,
  writeRecentSearches,
} from '../components/search/searchHelpers';
import { SAMPLE_SKILLS, SKILL_CATEGORIES, SUGGESTED_SKILL_NAMES } from '../components/skill/skillCatalog';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import { createBooking } from '../services/bookingService';
import { createOrOpenConversation } from '../services/chatService';
import { getAllSkills } from '../services/skillService';

function FilterIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 7H20" strokeLinecap="round" />
      <path d="M7 12H17" strokeLinecap="round" />
      <path d="M10 17H14" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M20 4V9H15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20V15H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 18A8 8 0 0 0 20 12.5V9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 6A8 8 0 0 0 4 11.5V15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusBanner({ tone = 'info', title, description, actionLabel, onAction, busy = false }) {
  const toneStyles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-teal-200 bg-teal-50 text-teal-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneStyles[tone] || toneStyles.info}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-80">{description}</p>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-current/20 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshIcon className="h-4 w-4" />
            {busy ? 'Retrying...' : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CompactStatusNote({ tone = 'info', title, description, actionLabel, onAction, busy = false }) {
  const toneStyles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-teal-200 bg-teal-50 text-teal-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  };

  return (
    <div className={`rounded-2xl border p-3.5 ${toneStyles[tone] || toneStyles.info}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-75">Live search</p>
          <p className="mt-1 text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-80">{description}</p>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-current/20 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshIcon className="h-4 w-4" />
            {busy ? 'Retrying...' : actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function NoResultsState({ onReset }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-10 w-10">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20L16.2 16.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 11H13.5" strokeLinecap="round" />
        </svg>
      </div>

      <h3 className="mt-5 text-xl font-semibold text-slate-950">
        No results match these filters
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
        Try a broader distance, clear a few chips, or search for a more common skill name to reopen the marketplace.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Reset search
      </button>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [maxDistance, setMaxDistance] = useState(DEFAULT_MAX_DISTANCE);
  const [sortOption, setSortOption] = useState('recommended');
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [fetchAlert, setFetchAlert] = useState(null);
  const [actionAlert, setActionAlert] = useState(null);
  const [bookingSkillId, setBookingSkillId] = useState('');
  const [chatSkillId, setChatSkillId] = useState('');

  const trimmedQuery = query.trim();
  const deferredSearchTerm = useDeferredValue(debouncedQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery.toLowerCase());
    }, 280);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (!isFilterDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsFilterDrawerOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterDrawerOpen]);

  useEffect(() => {
    let active = true;

    const loadSkills = async () => {
      setLoading(true);

      try {
        const response = await getAllSkills();

        if (!active) {
          return;
        }

        const liveSkills = Array.isArray(response) ? response : [];

        if (liveSkills.length) {
          setSkills(liveSkills.map(normalizeSkill));
          setFetchAlert(null);
        } else {
          setSkills(SAMPLE_SKILLS.map(normalizeSkill));
          setFetchAlert({
            tone: 'info',
            title: 'Marketplace is warming up',
            description: 'No live skills are published yet, so you are seeing curated sample listings for now.',
          });
        }
      } catch {
        if (!active) {
          return;
        }

        setSkills(SAMPLE_SKILLS.map(normalizeSkill));
        setFetchAlert({
          tone: 'warning',
          title: 'Live search is temporarily unavailable',
          description: 'Showing curated sample listings so you can continue exploring while the service reconnects.',
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSkills();

    return () => {
      active = false;
    };
  }, []);

  const filteredSkills = useMemo(() => {
    const matchingSkills = skills.filter((skill) => {
      const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
      const matchesMode = selectedMode === 'all' || skill.modeGroup === selectedMode;
      const matchesDistance = typeof skill.distanceKm === 'number' ? skill.distanceKm <= maxDistance : true;
      const matchesSearch = deferredSearchTerm
        ? buildSearchHaystack(skill).includes(deferredSearchTerm)
        : true;

      return matchesCategory && matchesMode && matchesDistance && matchesSearch;
    });

    return sortSkills(matchingSkills, sortOption);
  }, [deferredSearchTerm, maxDistance, selectedCategory, selectedMode, skills, sortOption]);

  useEffect(() => {
    if (!filteredSkills.length) {
      setSelectedSkillId('');
      return;
    }

    const stillSelected = filteredSkills.some((skill) => skill.id === selectedSkillId);

    if (!stillSelected) {
      startTransition(() => {
        setSelectedSkillId(filteredSkills[0].id);
      });
    }
  }, [filteredSkills, selectedSkillId]);

  const selectedSkill = useMemo(
    () => filteredSkills.find((skill) => skill.id === selectedSkillId) || filteredSkills[0] || null,
    [filteredSkills, selectedSkillId],
  );
  const showDetailPanel = loading || Boolean(selectedSkill);
  const contentGridClassName = showDetailPanel
    ? 'grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px]'
    : 'grid grid-cols-1 gap-5';

  const stats = useMemo(() => {
    const nearbyCount = skills.filter((skill) => typeof skill.distanceKm === 'number' && skill.distanceKm <= 10).length;
    const averageRating = skills.length
      ? (skills.reduce((sum, skill) => sum + skill.rating, 0) / skills.length).toFixed(1)
      : '0.0';

    return [
      { label: 'Live listings', value: skills.length || SAMPLE_SKILLS.length },
      { label: 'Nearby options', value: nearbyCount },
      { label: 'Avg. rating', value: averageRating },
      { label: 'Categories', value: SKILL_CATEGORIES.length },
    ];
  }, [skills]);

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (trimmedQuery) {
      chips.push({
        key: 'query',
        label: `Search: ${trimmedQuery}`,
        onRemove: () => setQuery(''),
      });
    }

    if (selectedCategory !== 'all') {
      chips.push({
        key: 'category',
        label: selectedCategory,
        onRemove: () => startTransition(() => setSelectedCategory('all')),
      });
    }

    if (selectedMode !== 'all') {
      chips.push({
        key: 'mode',
        label: `${selectedMode.charAt(0).toUpperCase()}${selectedMode.slice(1)}`,
        onRemove: () => startTransition(() => setSelectedMode('all')),
      });
    }

    if (maxDistance !== DEFAULT_MAX_DISTANCE) {
      chips.push({
        key: 'distance',
        label: `Within ${maxDistance} km`,
        onRemove: () => setMaxDistance(DEFAULT_MAX_DISTANCE),
      });
    }

    return chips;
  }, [maxDistance, selectedCategory, selectedMode, trimmedQuery]);

  const rememberSearch = (value) => {
    const trimmedValue = `${value || ''}`.trim();

    if (!trimmedValue) {
      return;
    }

    setRecentSearches((currentSearches) => {
      const nextSearches = [
        trimmedValue,
        ...currentSearches.filter((item) => item.toLowerCase() !== trimmedValue.toLowerCase()),
      ].slice(0, 6);

      writeRecentSearches(nextSearches);
      return nextSearches;
    });
  };

  const handleSuggestionSelect = (value) => {
    setQuery(value);
    rememberSearch(value);
  };

  const resetFilters = () => {
    startTransition(() => {
      setSelectedCategory('all');
      setSelectedMode('all');
      setMaxDistance(DEFAULT_MAX_DISTANCE);
      setSortOption('recommended');
    });
  };

  const resetSearch = () => {
    setQuery('');
    resetFilters();
  };

  const reloadSkills = async () => {
    setIsRefreshing(true);

    try {
      const response = await getAllSkills();
      const liveSkills = Array.isArray(response) ? response : [];

      if (liveSkills.length) {
        setSkills(liveSkills.map(normalizeSkill));
        setFetchAlert(null);
      } else {
        setSkills(SAMPLE_SKILLS.map(normalizeSkill));
        setFetchAlert({
          tone: 'info',
          title: 'Marketplace is warming up',
          description: 'There are still no live listings yet, so the sample marketplace remains visible.',
        });
      }
    } catch {
      setSkills(SAMPLE_SKILLS.map(normalizeSkill));
      setFetchAlert({
        tone: 'warning',
        title: 'Still offline',
        description: 'We could not refresh live results yet. Sample listings are still available below.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateBooking = async (skill) => {
    if (!skill) {
      return;
    }

    if (!isAuthenticated) {
      setActionAlert({
        tone: 'warning',
        title: 'Sign in to book a session',
        description: 'You need an account before creating a booking request.',
      });
      navigate('/login', { state: { from: { pathname: '/search' } } });
      return;
    }

    try {
      setBookingSkillId(skill.id);
      const createdBooking = await createBooking({ skillId: skill.id });

      setActionAlert({
        tone: 'success',
        title: 'Booking request created',
        description: `${skill.title} is now ${createdBooking.status}. You can continue in the bookings page.`,
      });
    } catch (requestError) {
      setActionAlert({
        tone: 'error',
        title: 'Could not create booking',
        description: requestError.message || 'Please try again in a moment.',
      });
    } finally {
      setBookingSkillId('');
    }
  };

  const handleChat = async (skill) => {
    if (!skill) {
      return;
    }

    if (!isAuthenticated) {
      setActionAlert({
        tone: 'warning',
        title: 'Sign in to start a chat',
        description: 'You need an account before opening a conversation with a provider.',
      });
      navigate('/login', { state: { from: { pathname: '/search' } } });
      return;
    }

    const providerId = skill.provider?.id || '';

    if (!providerId) {
      setActionAlert({
        tone: 'warning',
        title: 'Live chat is unavailable for this card',
        description: 'This listing is not connected to a real provider account yet, so a conversation cannot be created.',
      });
      return;
    }

    if (providerId === currentUser?.id) {
      setActionAlert({
        tone: 'warning',
        title: 'This is your own listing',
        description: 'Open the messages page to manage incoming chats from learners.',
      });
      navigate('/chat');
      return;
    }

    try {
      setChatSkillId(skill.id);
      const response = await createOrOpenConversation({
        skillId: skill.id,
        participantId: providerId,
      });
      const conversationId = response?.conversation?.id || '';

      setActionAlert({
        tone: 'success',
        title: response?.created ? 'Conversation started' : 'Conversation opened',
        description: `Your chat with ${skill.providerName} is ready in the messages area.`,
      });
      navigate('/chat', {
        state: {
          conversationId,
        },
      });
    } catch (requestError) {
      setActionAlert({
        tone: 'error',
        title: 'Could not open chat',
        description: requestError.message || 'Please try again in a moment.',
      });
    } finally {
      setChatSkillId('');
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-transparent pb-16 pt-6">
        <PageContainer maxWidth={1320} className="space-y-6">
          <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate whitespace-nowrap text-[clamp(1.05rem,4.8vw,2rem)] font-semibold leading-tight text-slate-900">
                    Find skills near you
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-full bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-4"
                  aria-label={`Open filters. ${activeFilterChips.length} active`}
                >
                  <FilterIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white sm:inline-flex">
                    {activeFilterChips.length}
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {stats.slice(0, 4).map((item) => (
                    <span
                      key={item.label}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      <span className="font-semibold text-slate-900">{item.value}</span> {item.label}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeFilterChips.length ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                    >
                      Clear all
                    </button>
                  ) : null}

                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-600">
                    <span className="pl-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 max-[479px]:hidden">
                      Sort
                    </span>
                    <select
                      value={sortOption}
                      onChange={(event) => setSortOption(event.target.value)}
                      className="rounded-full bg-transparent px-2 py-1 text-sm font-medium text-slate-700 outline-none"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSubmit={rememberSearch}
                onSuggestionSelect={handleSuggestionSelect}
                recentSearches={recentSearches}
                suggestions={SUGGESTED_SKILL_NAMES}
                resultCount={filteredSkills.length}
                activeFiltersCount={activeFilterChips.length}
              />

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
                {fetchAlert ? (
                  <CompactStatusNote
                    tone={fetchAlert.tone}
                    title={fetchAlert.title}
                    description={fetchAlert.description}
                    actionLabel="Refresh"
                    onAction={reloadSkills}
                    busy={isRefreshing}
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Live search</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">Connected to fresh results</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Listings are loading from the live marketplace and updating with your filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {isFilterDrawerOpen ? (
            <div
              className="fixed inset-0 z-50"
              role="dialog"
              aria-modal="true"
              aria-label="Search filters"
            >
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
              />

              <div className="absolute inset-y-0 right-0 w-full max-w-[440px] p-3 sm:p-4">
                <div className="h-full overflow-y-auto rounded-[28px] bg-slate-100 p-2 shadow-2xl sm:p-3">
                  <FilterSidebar
                    categories={SKILL_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onCategoryChange={(value) => startTransition(() => setSelectedCategory(value))}
                    selectedMode={selectedMode}
                    onModeChange={(value) => startTransition(() => setSelectedMode(value))}
                    maxDistance={maxDistance}
                    onDistanceChange={setMaxDistance}
                    onReset={resetFilters}
                    onClose={() => setIsFilterDrawerOpen(false)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <section className={contentGridClassName}>
            <section className="min-w-0 space-y-5">
              {actionAlert ? (
                <StatusBanner
                  tone={actionAlert.tone}
                  title={actionAlert.title}
                  description={actionAlert.description}
                />
              ) : null}

              {loading ? (
                <SearchResultsSkeleton />
              ) : filteredSkills.length ? (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {filteredSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      isActive={skill.id === selectedSkill?.id}
                      onSelect={(selectedSkillItem) => setSelectedSkillId(selectedSkillItem.id)}
                      onBook={handleCreateBooking}
                      onChat={handleChat}
                      isBooking={bookingSkillId === skill.id}
                      isChatting={chatSkillId === skill.id}
                    />
                  ))}
                </div>
              ) : (
                <NoResultsState onReset={resetSearch} />
              )}
            </section>

            {showDetailPanel ? (
              <aside className="hidden lg:block lg:self-start">
                <SkillDetailPanel
                  skill={selectedSkill}
                  onBook={handleCreateBooking}
                  onChat={handleChat}
                  isBooking={bookingSkillId === selectedSkill?.id}
                  isChatting={chatSkillId === selectedSkill?.id}
                  loading={loading}
                />
              </aside>
            ) : null}
          </section>
        </PageContainer>
      </main>

      <Footer />
    </>
  );
}
