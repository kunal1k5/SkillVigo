import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import useAuth from '../hooks/useAuth';
import {
  buildLocationLabel,
  getCityOptions,
  getCountryOptions,
  getStateOptions,
  reverseGeocodeCoordinates,
  withCurrentValue,
} from '../utils/locationOptions';
import { getDefaultRouteForRole } from '../utils/authRedirect';

const ROLE_OPTIONS = [
  {
    value: 'seeker',
    title: 'Hire talent',
    description: 'Find trusted local providers, tutors, and specialists with less back-and-forth.',
  },
  {
    value: 'provider',
    title: 'Offer services',
    description: 'Create your presence, attract clients, and manage work from one place.',
  },
];

const TRUST_POINTS = [
  'A faster setup with only the details you actually need.',
  'Clear role selection so the experience fits how you use the platform.',
  'A calmer form layout that stays easy to scan on mobile and desktop.',
];

const Icons = {
  user: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19a8 8 0 0 1 16 0" />
    </svg>
  ),
  mail: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 10.94 13a1.8 1.8 0 0 0 2.12 0L21 7.5" />
      <rect width="18" height="14" x="3" y="5" rx="3" />
    </svg>
  ),
  phone: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h2.38a1.5 1.5 0 0 1 1.43 1.06l.87 2.89a1.5 1.5 0 0 1-.69 1.73l-1.7.94a13.2 13.2 0 0 0 5.57 5.57l.94-1.7a1.5 1.5 0 0 1 1.73-.69l2.89.87A1.5 1.5 0 0 1 20 16.12v2.38A1.5 1.5 0 0 1 18.5 20h-.75C10.16 20 4 13.84 4 6.25V5.5Z"
      />
    </svg>
  ),
  mapPin: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.33 7-11a7 7 0 1 0-14 0c0 5.67 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  globe: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12H20.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5C14.6 5.8 16.1 8.8 16.1 12C16.1 15.2 14.6 18.2 12 20.5C9.4 18.2 7.9 15.2 7.9 12C7.9 8.8 9.4 5.8 12 3.5Z" />
    </svg>
  ),
  navigation: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.4 4.7L18.5 18.3L12.6 15.9L5.7 19.3L11.4 4.7Z" />
    </svg>
  ),
  skill: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 4.75h9l3 3v8.5l-3 3h-9l-3-3v-8.5l3-3Z" />
    </svg>
  ),
  lock: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V8a5 5 0 1 1 10 0v2" />
      <rect width="14" height="11" x="5" y="10" rx="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v3" />
    </svg>
  ),
};

function InputField({ label, name, type = 'text', value, onChange, placeholder, required, icon }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-emerald-600">*</span> : null}
      </span>
      <div className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-emerald-300 focus-within:bg-emerald-50/40 focus-within:shadow-md">
        {icon ? (
          <span className="mr-3 text-slate-400 transition-colors group-focus-within:text-emerald-600">
            {icon}
          </span>
        ) : null}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="h-full flex-1 border-none bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>
    </label>
  );
}

function SuggestionField({ label, name, value, onChange, required, icon, options, placeholder }) {
  const datalistId = `${name}-options`;

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-emerald-600">*</span> : null}
      </span>
      <div className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-emerald-300 focus-within:bg-emerald-50/40 focus-within:shadow-md">
        {icon ? (
          <span className="mr-3 text-slate-400 transition-colors group-focus-within:text-emerald-600">
            {icon}
          </span>
        ) : null}
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          list={options.length ? datalistId : undefined}
          className="h-full flex-1 border-none bg-transparent text-[15px] text-slate-900 focus:outline-none focus:ring-0"
        />
      </div>
      {options.length ? (
        <datalist id={datalistId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      ) : null}
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, required, rows = 3, icon }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-emerald-600">*</span> : null}
      </span>
      <div className="group flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-emerald-300 focus-within:bg-emerald-50/40 focus-within:shadow-md">
        {icon ? (
          <span className="mt-1 text-slate-400 transition-colors group-focus-within:text-emerald-600">
            {icon}
          </span>
        ) : null}
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="min-h-[96px] flex-1 resize-y border-none bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />
      </div>
    </label>
  );
}

function RoleSelector({ selectedRole, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLE_OPTIONS.map((option) => {
        const selected = option.value === selectedRole;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[26px] border p-5 text-left transition ${
              selected
                ? 'border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-100/60'
                : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-slate-900">{option.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{option.description}</p>
              </div>
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent'
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 7" />
                </svg>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SidePanel() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-emerald-200/60 bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_100%)] px-7 py-8 shadow-soft sm:px-9 sm:py-10">
      <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-100 blur-3xl" />

      <div className="relative flex h-full flex-col gap-7">
        <div className="space-y-4">
          <span className="inline-flex w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 shadow-sm">
            Create account
          </span>
          <div className="space-y-3">
            <h1 className="max-w-sm font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Join SkillVigo with a cleaner start.
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              Set up your profile once and move straight into finding opportunities or connecting with trusted local talent.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {TRUST_POINTS.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 7" />
                </svg>
              </span>
              <p className="text-sm leading-6 text-slate-600">{item}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-emerald-100 bg-slate-900 px-5 py-5 text-slate-50 shadow-lg shadow-slate-900/10">
          <p className="text-sm font-semibold text-white">What happens next</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            After signup, we will take you directly to the right experience for your role so you can get started immediately.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, authBusy } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'India',
    state: '',
    city: '',
    fullAddress: '',
    role: 'seeker',
    primarySkill: '',
  });
  const [error, setError] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationHint, setLocationHint] = useState('');

  const countryOptions = withCurrentValue(getCountryOptions(), formData.country);
  const stateOptions = withCurrentValue(getStateOptions(formData.country), formData.state);
  const cityOptions = withCurrentValue(
    getCityOptions(formData.country, formData.state),
    formData.city,
  );

  const passwordsMatch =
    formData.confirmPassword === '' || formData.password === formData.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError('');
    setLocationHint('');

    setFormData((currentData) => {
      if (name === 'country') {
        return {
          ...currentData,
          country: value,
          state: '',
          city: '',
        };
      }

      if (name === 'state') {
        return {
          ...currentData,
          state: value,
          city: '',
        };
      }

      return {
        ...currentData,
        [name]: value,
      };
    });
  };

  const handleRoleChange = (role) => {
    setFormData((currentData) => ({
      ...currentData,
      role,
    }));
  };

  const handleUseCurrentLocation = async () => {
    setError('');
    setLocationHint('');

    if (!navigator.geolocation) {
      setError('This browser does not support location access. Please fill the address manually.');
      return;
    }

    setLocationBusy(true);

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        });
      });

      const resolvedAddress = await reverseGeocodeCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setFormData((currentData) => ({
        ...currentData,
        country: resolvedAddress.country || currentData.country,
        state: resolvedAddress.state || currentData.state,
        city: resolvedAddress.city || currentData.city,
        fullAddress: resolvedAddress.fullAddress || currentData.fullAddress,
      }));
      setLocationHint('Location filled from your device. You can still adjust any field manually.');
    } catch (requestError) {
      if (requestError?.code === 1) {
        setError('Location permission was denied. Please allow it or fill the address manually.');
      } else if (requestError?.code === 2) {
        setError('Your current location could not be detected. Please fill the address manually.');
      } else if (requestError?.code === 3) {
        setError('Location request timed out. Please try again or enter the address manually.');
      } else {
        setError(requestError.message || 'Could not fetch your current location right now.');
      }
    } finally {
      setLocationBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Your passwords do not match. Please check them again.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const resolvedLocation =
        formData.fullAddress.trim() || buildLocationLabel(formData) || '';

      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        location: resolvedLocation,
      });

      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f0fdf4_36%,#f8fafc_100%)] font-sans text-slate-900">
      <Navbar />

      <main className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <SidePanel />

          <section className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700">
                Join SkillVigo
              </span>
              <h2 className="font-display text-3xl font-bold text-slate-900">Create your account</h2>
              <p className="text-sm leading-6 text-slate-500 sm:text-base">
                Share a few details so we can shape the experience around how you plan to use the platform.
              </p>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-10a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm0 7a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 15Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-7 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Choose your role</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {formData.role}
                  </span>
                </div>
                <RoleSelector selectedRole={formData.role} onChange={handleRoleChange} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Aarav Sharma"
                  required
                  icon={Icons.user}
                />
                <InputField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aarav.sharma@example.in"
                  required
                  icon={Icons.mail}
                />
              </div>

              {formData.role === 'provider' ? (
                <InputField
                  label="Primary skill"
                  name="primarySkill"
                  value={formData.primarySkill}
                  onChange={handleChange}
                  placeholder="Tutor, electrician, designer, coach..."
                  icon={Icons.skill}
                />
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required={false}
                  icon={Icons.phone}
                />
                <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Use current location</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Autofill address using your browser location permission.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locationBusy}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>{Icons.navigation}</span>
                      {locationBusy ? 'Fetching...' : 'Use my location'}
                    </button>
                  </div>
                  {locationHint ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">{locationHint}</p>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      Manual entry is always available if you prefer not to share your location.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-[28px] border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Location details</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Optional: add a location to help local discovery, or leave it blank and continue.
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {buildLocationLabel(formData) || 'Address pending'}
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <SuggestionField
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required={false}
                    icon={Icons.globe}
                    options={countryOptions}
                    placeholder="Choose or type country"
                  />
                  <SuggestionField
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required={false}
                    icon={Icons.mapPin}
                    options={stateOptions}
                    placeholder={formData.country ? 'Choose or type state' : 'Type state'}
                  />
                  <SuggestionField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required={false}
                    icon={Icons.mapPin}
                    options={cityOptions}
                    placeholder={formData.state ? 'Choose or type city' : 'Type city'}
                  />
                </div>

                <TextAreaField
                  label="Full address"
                  name="fullAddress"
                  value={formData.fullAddress}
                  onChange={handleChange}
                  placeholder="House number, street, area, landmark, postal code..."
                  required={false}
                  rows={4}
                  icon={Icons.mapPin}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  required
                  icon={Icons.lock}
                />
                <div className="space-y-2">
                  <InputField
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    required
                    icon={Icons.lock}
                  />
                  {!passwordsMatch ? (
                    <p className="text-sm font-medium text-rose-600">Passwords do not match yet.</p>
                  ) : (
                    <p className="text-sm text-slate-400">Use a strong password with at least 8 characters.</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={authBusy || !passwordsMatch}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {authBusy ? 'Creating your account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
                Sign in
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
