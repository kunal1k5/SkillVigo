import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import SkillCard from '../components/skill/SkillCard';
import SkillDetailsPanel from '../components/skill/SkillDetailsPanel';
import { SKILL_CATEGORIES, SUGGESTED_SKILL_NAMES } from '../components/skill/skillCatalog';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import useAuth from '../hooks/useAuth';
import { createBooking } from '../services/bookingService';
import { getAllSkills } from '../services/skillService';

const MODE_FILTERS = ['all', 'local', 'online', 'hybrid'];

function getModeGroup(modeValue = '') {
  const normalizedMode = modeValue.toLowerCase();

  if (normalizedMode.includes('online')) {
    return 'online';
  }

  if (normalizedMode.includes('hybrid')) {
    return 'hybrid';
  }

  return 'local';
}

export default function Search() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [withinRadiusOnly, setWithinRadiusOnly] = useState(true);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [actionNote, setActionNote] = useState('');

  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());

  useEffect(() => {
    let isMounted = true;

    const loadSkills = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getAllSkills();

        if (!isMounted) {
          return;
        }

        setSkills(data);
        setSelectedSkillId((currentSelectedSkillId) => currentSelectedSkillId || data[0]?.id || '');
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(requestError.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSkills();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
      const matchesMode = selectedMode === 'all' || getModeGroup(skill.mode) === selectedMode;
      const matchesRadius = !withinRadiusOnly || (typeof skill.distanceKm === 'number' && skill.distanceKm <= 10);

      if (!matchesCategory || !matchesMode || !matchesRadius) {
        return false;
      }

      if (!deferredSearchTerm) {
        return true;
      }

      const searchHaystack = [
        skill.title,
        skill.category,
        skill.instructorName,
        skill.area,
        skill.description,
        ...(skill.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchHaystack.includes(deferredSearchTerm);
    });
  }, [deferredSearchTerm, selectedCategory, selectedMode, skills, withinRadiusOnly]);

  const filteredSkillIds = filteredSkills.map((skill) => skill.id).join('|');

  useEffect(() => {
    if (!filteredSkills.length) {
      return;
    }

    const hasSelectedSkill = filteredSkills.some((skill) => skill.id === selectedSkillId);

    if (!hasSelectedSkill) {
      startTransition(() => {
        setSelectedSkillId(filteredSkills[0].id);
      });
    }
  }, [filteredSkillIds, filteredSkills, selectedSkillId]);

  const selectedSkill =
    filteredSkills.find((skill) => skill.id === selectedSkillId) || filteredSkills[0] || null;

  const localSkillCount = skills.filter((skill) => skill.distanceKm <= 10).length;
  const averageRating = skills.length
    ? (skills.reduce((sum, skill) => sum + Number(skill.rating || 0), 0) / skills.length).toFixed(1)
    : '0.0';

  const stats = [
    {
      label: 'Listed skills',
      value: skills.length,
      detail: 'Real listings coming from your backend API.',
      accent: 'linear-gradient(90deg, #2563eb 0%, #0f766e 100%)',
    },
    {
      label: 'Within 10 km',
      value: localSkillCount,
      detail: 'Skills that match your nearby hiring vision.',
      accent: 'linear-gradient(90deg, #0f766e 0%, #22c55e 100%)',
    },
    {
      label: 'Average rating',
      value: averageRating,
      detail: 'A premium local section should highlight quality and trust quickly.',
      accent: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)',
    },
    {
      label: 'Skill categories',
      value: SKILL_CATEGORIES.length,
      detail: 'Broad enough for normal users to add useful everyday skills.',
      accent: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
    },
  ];

  const handleCreateBooking = async (skill) => {
    if (!isAuthenticated) {
      setActionNote('Please sign in before creating a booking.');
      navigate('/login', { state: { from: { pathname: '/search' } } });
      return;
    }

    try {
      setActionNote(`Creating booking for ${skill.title}...`);
      const createdBooking = await createBooking({ skillId: skill.id });
      setActionNote(
        `Booking created for ${skill.title}. Status: ${createdBooking.status}. Check the bookings page.`,
      );
    } catch (requestError) {
      setActionNote(`Could not create booking: ${requestError.message}`);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-transparent pb-16 pt-6">
        <PageContainer className="space-y-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Global Skill Search
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">
                  Real skills people can add, share and hire nearby.
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Search through listings from the community. Tum jo skill create karoge, woh yahan dikhegi.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3 md:mt-0 md:items-end">
                <Link
                  to="/create-skill"
                  className="rounded-full bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift text-center"
                >
                  Add your own skill
                </Link>
                <Link
                  to="/chat"
                  className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift text-center"
                >
                  Talk to nearby experts
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {SUGGESTED_SKILL_NAMES.slice(0, 8).map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
            {/* Left Sidebar - Filters & Stats */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
              
              {/* Search Input */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
                <p className="mb-3 text-sm font-semibold text-slate-900">Search</p>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Try: yoga, canva..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
                <p className="mb-4 text-sm font-semibold text-slate-900">Categories</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                    onClick={() => startTransition(() => setSelectedCategory('all'))}
                  >
                    All categories
                  </button>
                  {SKILL_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        selectedCategory === category.label
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => startTransition(() => setSelectedCategory(category.label))}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <p className="mb-4 mt-6 text-sm font-semibold text-slate-900">Delivery Mode</p>
                <div className="flex flex-wrap gap-2">
                  {MODE_FILTERS.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        selectedMode === mode
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      onClick={() => startTransition(() => setSelectedMode(mode))}
                    >
                      {mode === 'all' ? 'All' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                <p className="mb-4 mt-6 text-sm font-semibold text-slate-900">Distance</p>
                <button
                  type="button"
                  className={`w-full rounded-xl border px-4 py-2 text-xs font-medium transition ${
                    withinRadiusOnly
                      ? 'border-teal-200 bg-teal-50 text-teal-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  onClick={() => setWithinRadiusOnly((c) => !c)}
                >
                  {withinRadiusOnly ? '✓ Only within 10 km' : 'Show all distances'}
                </button>
              </div>

              {/* Stats mini-cards */}
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
                {stats.slice(0, 2).map((item) => (
                  <div key={item.label} className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                    <p className="text-lg font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Feed - Results */}
            <div className="space-y-4">
              {actionNote ? (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-800">
                  {actionNote}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-between px-2 py-1">
                <h2 className="text-lg font-bold text-slate-900">
                  {filteredSkills.length} Search Result{filteredSkills.length !== 1 ? 's' : ''}
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white/90 p-10 shadow-soft">
                  <Loader message="Loading nearby skills..." />
                </div>
              ) : filteredSkills.length ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {filteredSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      isActive={selectedSkill?.id === skill.id}
                      onSelect={(selectedSkillItem) => setSelectedSkillId(selectedSkillItem.id)}
                      onBook={handleCreateBooking}
                      actionLabel="Hire or book"
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-8 text-center text-slate-500 shadow-soft">
                  <p className="mb-2 text-lg font-semibold text-slate-700">
                    No skill matches this filter.
                  </p>
                  <p className="text-sm">
                    Search ko simple rakho ya category reset karo. Skill names short aur clear honge to discoverability bhi better hogi.
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar - Detail Panel */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SkillDetailsPanel skill={selectedSkill} />
            </div>
          </section>
        </PageContainer>
      </main>

      <Footer />
    </>
  );
}
