import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Loader from '../components/common/Loader';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useAuth from '../hooks/useAuth';
import { deleteSkill as deleteSkillRequest } from '../services/skillService';
import {
  getCurrentUserProfile,
  getUserProfile,
} from '../services/userService';

// STUB DATA for demonstration
const MOCK_PROFILE = {
  id: 'user_123',
  name: 'Ananya Sharma',
  role: 'provider',
  location: 'Mathura, UP',
  avatarUrl: '',
  isVerified: true,
  rating: 4.8,
  bio: 'Senior Full-Stack Developer and Technical Consultant. Passionate about teaching modern web technologies and helping businesses scale their digital infrastructure.',
  stats: {
    totalBookings: 124,
    totalSkills: 6,
    experience: '8 Years',
    activeClients: 15
  },
  skills: [
    { id: 1, title: 'React Performance Tuning', price: '/hr', experience: 'Expert' },
    { id: 2, title: 'Node.js Backend Architecture', price: '/hr', experience: 'Expert' },
    { id: 3, title: 'WebRTC Video Streaming', price: '/hr', experience: 'Advanced' }
  ],
  reviews: [
    { id: 1, reviewer: 'Rohit M.', rating: 5, comment: 'Ananya is an incredible mentor. She fixed my architecture issues in one session.' },
    { id: 2, reviewer: 'Priya K.', rating: 5, comment: 'Very professional and has deep knowledge of React internals.' },
    { id: 3, reviewer: 'Devansh L.', rating: 4, comment: 'Great session, and the guidance was practical and easy to follow.' }
  ],
  about: {
    description: 'I am a software engineer with over 8 years of experience building scalable web applications. I specialize in the React and Node.js ecosystem, cloud infrastructure, and product mentoring for startups and growing teams across India.',
    email: 'ananya.sharma@example.in',
    website: 'https://ananyasharma.dev',
    joined: 'March 2021'
  },
  showSkillsSection: true,
};

// COMPONENTS

const VerifiedBadge = ({ roleLabel = 'Member' }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
    Verified {roleLabel}
  </span>
);

function getAvatarFallback(name = 'SkillVigo member') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=020617&color=fff`;
}

function getAvatarSource(profile) {
  return profile.avatarUrl || getAvatarFallback(profile.name);
}

const ProfileHeader = ({ profile, isOwnProfile }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/2 -translate-y-1/2" />
      
      {/* Avatar */}
      <div className="relative shrink-0 group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
          <img 
            src={getAvatarSource(profile)}
            alt={profile.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
            {profile.isVerified && <VerifiedBadge roleLabel={profile.role} />}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="capitalize text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{profile.role}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {profile.location}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-400">?</span>
              {profile.rating} Rating
            </span>
          </div>
        </div>
        
        <p className="text-slate-600 leading-relaxed max-w-3xl">
          {profile.bio}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {isOwnProfile ? (
            <>
              <Link
                to="/profile/edit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                Edit Profile & Settings
              </Link>
              {profile.role === 'provider' ? (
                <Link
                  to="/create-skill"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Add Skill
                </Link>
              ) : null}
            </>
          ) : (
            <>
              {profile.role === 'provider' && (
                <Link
                  to="/bookings"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Book Session
                </Link>
              )}
              <Link
                to="/chat"
                className="px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
              >
                Message
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsSection = ({ stats }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      { label: 'Total Bookings', value: stats.totalBookings, icon: 'TB' },
      { label: 'Listed Skills', value: stats.totalSkills, icon: 'LS' },
      { label: 'Experience', value: stats.experience, icon: 'EX' },
      { label: 'Active Clients', value: stats.activeClients, icon: 'AC' }
    ].map((stat, idx) => (
      <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-sm font-bold tracking-wide text-slate-700 shrink-0">
          {stat.icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          <div className="text-sm font-medium text-slate-500">{stat.label}</div>
        </div>
      </div>
    ))}
  </div>
);

const SkillCard = ({ skill, canManage = false, onDeleteSkill, deletingSkillId = '' }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all group">
    <div className="flex justify-between items-start gap-4 mb-4">
      <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
        {skill.title}
      </h3>
      <span className="shrink-0 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold border border-green-100">
        {skill.price}
      </span>
    </div>
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
      <span className="text-sm font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md">
        {skill.experience}
      </span>
      {canManage ? (
        <button
          type="button"
          onClick={() => onDeleteSkill?.(skill)}
          disabled={`${deletingSkillId}` === `${skill.id}`}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {`${deletingSkillId}` === `${skill.id}` ? 'Deleting...' : 'Delete'}
        </button>
      ) : (
        <Link to="/bookings" className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          Book Session
        </Link>
      )}
    </div>
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
          <img src={"https://ui-avatars.com/api/?name=" + encodeURIComponent(review.reviewer) + "&background=random"} alt={review.reviewer} />
        </div>
        <div>
          <div className="font-semibold text-slate-900">{review.reviewer}</div>
          <div className="flex text-amber-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-30'}>?</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <p className="text-slate-600 leading-relaxed text-sm">"{review.comment}"</p>
  </div>
);

function normalizeRoleLabel(role = '') {
  if (!role) {
    return 'member';
  }

  return role.replace(/_/g, ' ').trim();
}

function buildProfileFromUser(currentUser) {
  if (!currentUser) {
    return MOCK_PROFILE;
  }

  const normalizedRole = normalizeRoleLabel(currentUser.role).toLowerCase();
  const isProvider = normalizedRole === 'provider';
  const firstName = (currentUser.name || 'Member').split(' ')[0];
  const reviews = Array.isArray(currentUser.reviews) ? currentUser.reviews : [];
  const skills = Array.isArray(currentUser.skills)
    ? currentUser.skills.map((skill, index) => ({
        id: skill.id || skill._id || index + 1,
        title: skill.title || skill.name || 'Untitled skill',
        price:
          typeof skill.price === 'number'
            ? `${new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(skill.price)}/session`
            : skill.price || skill.rate || '/session',
        experience:
          typeof skill.experience === 'number'
            ? skill.experience > 0
              ? `${skill.experience}+ yrs`
              : 'Newly added'
            : skill.experience || 'Available',
      }))
    : [];

  return {
    id: currentUser.id || currentUser._id || 'current-user',
    name: currentUser.name || 'SkillVigo member',
    role: normalizedRole || 'member',
    location: currentUser.location || 'Location not added yet',
    isVerified:
      typeof currentUser.isVerified === 'boolean'
        ? currentUser.isVerified
        : Boolean(currentUser.emailVerified && currentUser.phoneVerified),
    rating:
      typeof currentUser.rating === 'number'
        ? currentUser.rating
        : typeof currentUser.averageRating === 'number'
          ? currentUser.averageRating
          : 0,
    bio:
      currentUser.bio ||
      `This is ${firstName}'s SkillVigo profile. Add a short bio to help people understand your background and strengths.`,
    stats: {
      totalBookings: currentUser.totalBookings || currentUser.bookingCount || 0,
      totalSkills: currentUser.totalSkills || skills.length,
      experience: currentUser.experience || 'Just getting started',
      activeClients: currentUser.activeClients || 0,
    },
    skills,
    reviews,
    about: {
      description:
        currentUser.about ||
        currentUser.bio ||
        `Welcome to ${firstName}'s profile. More detailed profile information can be added here over time.`,
      email: currentUser.email || 'Not shared yet',
      website: currentUser.website || '',
      joined: currentUser.createdAt
        ? new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
          }).format(new Date(currentUser.createdAt))
        : 'Recently joined',
    },
    phone: currentUser.phone || '',
    avatarUrl: currentUser.avatarUrl || '',
    showSkillsSection: isProvider,
  };
}

function normalizeWebsiteValue(value = '') {
  const trimmedValue = `${value || ''}`.trim();

  if (!trimmedValue) {
    return '';
  }

  return /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not process the selected image.'));
    image.src = dataUrl;
  });
}

async function createAvatarDataUrl(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('Please choose an image file for your profile photo.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Profile photo must be smaller than 5 MB.');
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const outputSize = 320;
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const squareSize = Math.min(sourceWidth, sourceHeight);
  const offsetX = Math.max((sourceWidth - squareSize) / 2, 0);
  const offsetY = Math.max((sourceHeight - squareSize) / 2, 0);

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not prepare the selected image.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(
    image,
    offsetX,
    offsetY,
    squareSize,
    squareSize,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvas.toDataURL('image/jpeg', 0.82);
}

function createSettingsForm(profile) {
  return {
    name: profile.name || '',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.about.website || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || '',
  };
}

function SettingsPanel({
  profile,
  formData,
  onChange,
  onPickPhoto,
  onPhotoChange,
  onRemovePhoto,
  onSubmit,
  onReset,
  authBusy,
  photoBusy,
  photoInputRef,
  saveState,
  hasChanges,
}) {
  const statusToneStyles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl flex items-center justify-center sm:justify-start gap-2 font-bold text-slate-900">
            <Settings className="w-5 h-5 text-slate-500"/> Profile Settings
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Update the details people see on your SkillVigo profile.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          {profile.role}
        </span>
      </div>

      {saveState.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            statusToneStyles[saveState.tone] || statusToneStyles.success
          }`}
        >
          {saveState.message}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-sm">
                <img
                  src={getAvatarSource({
                    name: formData.name || profile.name,
                    avatarUrl: formData.avatarUrl,
                  })}
                  alt={formData.name || profile.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Profile Photo</h3>
                <p className="text-sm leading-6 text-slate-500">
                  Upload a clear headshot or logo. JPG, PNG, and WebP are supported.
                </p>
                <p className="text-xs font-medium text-slate-400">
                  After changing or removing your photo, click save to update your profile.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onPhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={onPickPhoto}
                disabled={photoBusy || authBusy}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {photoBusy ? 'Preparing...' : formData.avatarUrl ? 'Change Photo' : 'Add Photo'}
              </button>
              <button
                type="button"
                onClick={onRemovePhoto}
                disabled={photoBusy || authBusy || !formData.avatarUrl}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Full Name</span>
            <input
              name="name"
              value={formData.name}
              onChange={onChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              placeholder="Your full name"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              value={profile.about.email}
              readOnly
              className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              placeholder="+91 98765 43210"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Location</span>
            <input
              name="location"
              value={formData.location}
              onChange={onChange}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
              placeholder="City, State"
            />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Website</span>
          <input
            name="website"
            value={formData.website}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            placeholder="yourportfolio.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-700">Bio</span>
          <textarea
            name="bio"
            rows={5}
            value={formData.bio}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
            placeholder="Tell people what you do, what you teach, or what kind of help you offer."
          />
        </label>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Member since <span className="font-semibold text-slate-700">{profile.about.joined}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              disabled={authBusy || photoBusy || !hasChanges}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={authBusy || photoBusy || !hasChanges}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {photoBusy ? 'Preparing Photo...' : authBusy ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function Profile() {
  const { id: profileId } = useParams();
  const location = useLocation();
  const { currentUser, updateProfile, authBusy, isAuthenticated } = useAuth();
  const isOwnProfile = Boolean(currentUser && (!profileId || profileId === currentUser.id));
  const [profileData, setProfileData] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const profileSource = profileData || (isOwnProfile ? currentUser : null);
  const profile = useMemo(() => buildProfileFromUser(profileSource), [profileSource]);
  const defaultTab = useMemo(
    () => (location.pathname === '/profile/edit' && isOwnProfile
      ? 'settings'
      : profile.showSkillsSection
        ? 'skills'
        : 'reviews'),
    [isOwnProfile, location.pathname, profile.showSkillsSection],
  );
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [settingsForm, setSettingsForm] = useState(() => createSettingsForm(profile));
  const [saveState, setSaveState] = useState({ tone: 'success', message: '' });
  const [skillActionState, setSkillActionState] = useState({ tone: 'success', message: '' });
  const [deletingSkillId, setDeletingSkillId] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef(null);

  const normalizedCurrentSettings = useMemo(
    () => createSettingsForm(profile),
    [profile],
  );

  const hasChanges = useMemo(
    () =>
      JSON.stringify({
        ...settingsForm,
        website: normalizeWebsiteValue(settingsForm.website),
      }) !==
      JSON.stringify({
        ...normalizedCurrentSettings,
        website: normalizeWebsiteValue(normalizedCurrentSettings.website),
      }),
    [normalizedCurrentSettings, settingsForm],
  );

  const tabs = [
    ...(profile.showSkillsSection ? [{ id: 'skills', label: 'Skills' }] : []),
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About' },
    ...(isOwnProfile ? [{ id: 'settings', label: 'Settings' }] : []),
  ];

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setSettingsForm(createSettingsForm(profile));
  }, [profile]);

  useEffect(() => {
    let isCancelled = false;

    const loadProfile = async () => {
      if (!profileId && !isAuthenticated) {
        setProfileData(null);
        setProfileError('');
        setProfileBusy(false);
        return;
      }

      setProfileBusy(true);
      setProfileError('');

      try {
        const nextProfile =
          !profileId || (currentUser && profileId === currentUser.id)
            ? await getCurrentUserProfile()
            : await getUserProfile(profileId);

        if (!isCancelled) {
          setProfileData(nextProfile);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setProfileData(null);
          setProfileError(requestError.message || 'Could not load this profile right now.');
        }
      } finally {
        if (!isCancelled) {
          setProfileBusy(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [currentUser, isAuthenticated, profileId]);

  useEffect(() => {
    if (!saveState.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveState({ tone: 'success', message: '' });
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [saveState.message]);

  useEffect(() => {
    if (!skillActionState.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSkillActionState({ tone: 'success', message: '' });
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [skillActionState.message]);

  const handleSettingsChange = (event) => {
    const { name, value } = event.target;
    setSettingsForm((currentState) => ({
      ...currentState,
      [name]: value,
    }));
    setSaveState({ tone: 'success', message: '' });
  };

  const handleSettingsReset = () => {
    setSettingsForm(createSettingsForm(profile));
    setSaveState({ tone: 'success', message: '' });
  };

  const handlePickPhoto = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSaveState({ tone: 'success', message: '' });
    setPhotoBusy(true);

    try {
      const avatarUrl = await createAvatarDataUrl(file);
      setSettingsForm((currentState) => ({
        ...currentState,
        avatarUrl,
      }));
      setSaveState({
        tone: 'success',
        message: 'Profile photo is ready. Save changes to update it on your profile.',
      });
    } catch (requestError) {
      setSaveState({
        tone: 'error',
        message: requestError.message || 'Could not prepare your profile photo.',
      });
    } finally {
      event.target.value = '';
      setPhotoBusy(false);
    }
  };

  const handleRemovePhoto = () => {
    setSettingsForm((currentState) => ({
      ...currentState,
      avatarUrl: '',
    }));
    setSaveState({
      tone: 'success',
      message: 'Profile photo removed. Save changes to apply this update.',
    });
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setSaveState({
        tone: 'error',
        message: 'Please sign in before editing your profile settings.',
      });
      return;
    }

    try {
      const updatedUser = await updateProfile({
        name: settingsForm.name,
        phone: settingsForm.phone,
        location: settingsForm.location,
        bio: settingsForm.bio,
        website: settingsForm.website,
        avatarUrl: settingsForm.avatarUrl,
      });
      const refreshedProfile = await getCurrentUserProfile();
      setProfileData(refreshedProfile || updatedUser);

      setSaveState({
        tone: 'success',
        message: 'Profile settings updated successfully.',
      });
    } catch (requestError) {
      setSaveState({
        tone: 'error',
        message: requestError.message || 'Could not save your profile settings.',
      });
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (!skill?.id || deletingSkillId || !isOwnProfile) {
      return;
    }

    if (!isAuthenticated) {
      setSkillActionState({
        tone: 'error',
        message: 'Sign in required before deleting skills.',
      });
      return;
    }

    const confirmed = window.confirm(`Delete ${skill.title}?`);

    if (!confirmed) {
      return;
    }

    const targetId = `${skill.id}`;
    setDeletingSkillId(targetId);
    setSkillActionState({ tone: 'success', message: '' });

    try {
      await deleteSkillRequest(targetId);

      setProfileData((currentState) => {
        if (!currentState) {
          return currentState;
        }

        const nextSkills = (currentState.skills || []).filter(
          (item) => `${item.id || item._id}` !== targetId,
        );

        return {
          ...currentState,
          skills: nextSkills,
          totalSkills: nextSkills.length,
        };
      });

      setSkillActionState({
        tone: 'success',
        message: `${skill.title} deleted successfully.`,
      });

      try {
        const refreshedProfile = await getCurrentUserProfile();
        setProfileData(refreshedProfile);
      } catch {
        // Keep optimistic UI state if silent refresh fails.
      }
    } catch (requestError) {
      setSkillActionState({
        tone: 'error',
        message: requestError.message || 'Could not delete this skill right now.',
      });
    } finally {
      setDeletingSkillId('');
    }
  };

  if (!profileId && !isAuthenticated && !profileBusy) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-14">
          <section className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              Profile access
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to open your profile settings.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Your personal profile data now comes from the backend. Sign in first so we can load your account details, saved photo, bio, and profile settings.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to login
              </Link>
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Create account
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (profileBusy && !profileData && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Loader size="lg" message="Loading profile..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (profileError && !profileData && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-14">
          <section className="rounded-[30px] border border-rose-200 bg-white p-8 shadow-sm">
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
              Could not load profile
            </span>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{profileError}</p>
            <Link
              to="/"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to home
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12 space-y-8">
        {profileBusy ? (
          <div className="flex justify-center">
            <Loader size="md" message="Refreshing profile..." />
          </div>
        ) : null}

        {profileError && profileData ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {profileError}
          </div>
        ) : null}
        
        {/* Top Profile Header */}
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

        {/* Stats Section */}
        {profile.showSkillsSection && (
          <StatsSection stats={profile.stats} />
        )}

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-8 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"pb-4 text-sm font-semibold transition-all relative " + (activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:text-slate-700")}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tabs Content */}
        <div className="min-h-[300px]">
          {/* SKILLS TAB */}
          {activeTab === 'skills' && profile.showSkillsSection && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {skillActionState.message ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                    skillActionState.tone === 'error'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {skillActionState.message}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.skills.map(skill => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    canManage={isOwnProfile && profile.role === 'provider'}
                    onDeleteSkill={handleDeleteSkill}
                    deletingSkillId={deletingSkillId}
                  />
                ))}
              </div>

              {profile.skills.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p>No skills listed yet.</p>
                  {isOwnProfile && profile.role === 'provider' ? (
                    <Link
                      to="/create-skill"
                      className="mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Create your first skill
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {profile.reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {profile.reviews.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                  No reviews yet.
                </div>
              )}
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">About {profile.name.split(' ')[0]}</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {profile.about.description}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div>
                  <div className="text-sm font-medium text-slate-400 mb-1">Contact Email</div>
                  {profile.about.email && profile.about.email !== 'Not shared yet' ? (
                    <a href={"mailto:" + profile.about.email} className="text-slate-900 font-medium hover:text-blue-600 transition-colors">
                      {profile.about.email}
                    </a>
                  ) : (
                    <div className="text-slate-500 font-medium">Not shared yet</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-400 mb-1">Website</div>
                  {profile.about.website ? (
                    <a href={profile.about.website} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-medium hover:text-blue-600 transition-colors">
                      {profile.about.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <div className="text-slate-500 font-medium">Not added yet</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-400 mb-1">Member Since</div>
                  <div className="text-slate-900 font-medium">
                    {profile.about.joined}
                  </div>
                </div>
                {profile.phone ? (
                  <div>
                    <div className="text-sm font-medium text-slate-400 mb-1">Phone</div>
                    <div className="text-slate-900 font-medium">{profile.phone}</div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {activeTab === 'settings' && isOwnProfile && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SettingsPanel
                profile={profile}
                formData={settingsForm}
                onChange={handleSettingsChange}
                onPickPhoto={handlePickPhoto}
                onPhotoChange={handlePhotoChange}
                onRemovePhoto={handleRemovePhoto}
                onSubmit={handleSettingsSubmit}
                onReset={handleSettingsReset}
                authBusy={authBusy}
                photoBusy={photoBusy}
                photoInputRef={photoInputRef}
                saveState={saveState}
                hasChanges={hasChanges}
              />
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
