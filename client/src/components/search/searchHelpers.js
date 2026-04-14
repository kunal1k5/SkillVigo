export const DEFAULT_MAX_DISTANCE = 10;
export const RECENT_SEARCHES_KEY = 'skillvigo-search-recents-v1';

export const DELIVERY_OPTIONS = [
  { id: 'offline', label: 'Nearby', description: 'In-person sessions within your 10 km radius.' },
  { id: 'hybrid', label: 'Hybrid nearby', description: 'Listings that include in-person availability nearby.' },
  { id: 'all', label: 'All nearby', description: 'All nearby listings that support in-person sessions.' },
];

export const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];

export function getModeGroup(modeValue = '') {
  const normalizedMode = `${modeValue}`.toLowerCase();

  if (normalizedMode.includes('online')) {
    return 'online';
  }

  if (normalizedMode.includes('hybrid')) {
    return 'hybrid';
  }

  return 'offline';
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export function formatDistanceLabel(distanceKm) {
  return typeof distanceKm === 'number' ? `${distanceKm.toFixed(1)} km away` : 'Remote friendly';
}

export function getProviderName(skill = {}) {
  return (
    skill.instructor?.name ||
    skill.provider?.name ||
    skill.instructorName ||
    skill.providerName ||
    'SkillVigo Expert'
  );
}

export function getProviderInitials(name = '') {
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

export function normalizeSkill(skill = {}, index = 0) {
  const providerName = getProviderName(skill);
  const priceValue = Number(skill.price || 0);
  const ratingValue = Number(skill.rating || 0);
  const distanceKm = typeof skill.distanceKm === 'number' ? skill.distanceKm : null;

  return {
    ...skill,
    id: skill.id || skill._id || `skill-${index}`,
    providerName,
    providerInitials: getProviderInitials(providerName),
    title: skill.title || 'Untitled skill',
    category: skill.category || 'Community skill',
    description:
      skill.description ||
      'A practical SkillVigo session designed to help learners move from interest to confident action.',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    currency: skill.currency || 'INR',
    rating: Number.isFinite(ratingValue) ? ratingValue : 0,
    distanceKm,
    distanceLabel: skill.distanceLabel || formatDistanceLabel(distanceKm),
    location: skill.area || skill.location || 'Remote / flexible',
    mode: skill.mode || 'Hybrid',
    modeGroup: getModeGroup(skill.mode),
    availability: skill.availability || 'Schedule on request',
    responseTime: skill.responseTime || 'Usually replies within the day',
    learnersHelped: Number(skill.learnersHelped || 0),
    duration: Number(skill.duration || 60),
    level: skill.level || 'All levels',
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    outcomes: Array.isArray(skill.outcomes) ? skill.outcomes : [],
    accent: skill.accent || 'linear-gradient(135deg, #0f172a 0%, #2563eb 48%, #0f766e 100%)',
  };
}

export function sortSkills(skills = [], sortOption = 'recommended') {
  const sortedSkills = [...skills];

  switch (sortOption) {
    case 'rating':
      return sortedSkills.sort((first, second) => second.rating - first.rating);
    case 'price-low':
      return sortedSkills.sort((first, second) => first.price - second.price);
    case 'price-high':
      return sortedSkills.sort((first, second) => second.price - first.price);
    case 'recommended':
    default:
      return sortedSkills.sort((first, second) => {
        const firstScore = (first.rating * 12) - (first.distanceKm ?? 12);
        const secondScore = (second.rating * 12) - (second.distanceKm ?? 12);
        return secondScore - firstScore;
      });
  }
}

export function buildSearchHaystack(skill = {}) {
  return [
    skill.title,
    skill.category,
    skill.providerName,
    skill.location,
    skill.description,
    skill.mode,
    skill.level,
    ...(skill.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function readRecentSearches() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(RECENT_SEARCHES_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(Boolean).slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function writeRecentSearches(searches = []) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, 6)));
}
