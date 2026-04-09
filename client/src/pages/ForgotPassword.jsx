import { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { requestPasswordReset } from '../services/authService';

const STEPS = [
  'Enter the email address connected to your SkillVigo account.',
  'We generate a time-limited reset link for that account.',
  'Set a new password and sign back in without creating a new profile.',
];

const Icons = {
  mail: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 10.94 13a1.8 1.8 0 0 0 2.12 0L21 7.5" />
      <rect width="18" height="14" x="3" y="5" rx="3" />
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

function SidePanel() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/92 px-7 py-8 text-slate-900 shadow-soft backdrop-blur sm:px-9 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.12),_transparent_35%)]" />
      <div className="relative flex h-full flex-col gap-7">
        <div className="space-y-4">
          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Password help
          </span>
          <div className="space-y-3">
            <h1 className="max-w-sm font-display text-3xl font-bold leading-tight sm:text-4xl">
              Reset your password without losing your account.
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              We will prepare a secure reset link so you can get back to your dashboard, chats, and bookings.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {STEPS.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 7" />
                </svg>
              </span>
              <p className="text-sm leading-6 text-slate-600">{item}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50/95 p-5 text-sm leading-6 text-slate-600">
          The reset link is sent to the registered email address, so users can recover their account directly from their inbox.
        </div>
      </div>
    </section>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const response = await requestPasswordReset({ email });
      setSuccessMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfdf5_38%,#f8fafc_100%)] font-sans text-slate-900">
      <Navbar />

      <main className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <SidePanel />

          <section className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700">
                Forgot password
              </span>
              <h2 className="font-display text-3xl font-bold text-slate-900">Request a reset link</h2>
              <p className="text-sm leading-6 text-slate-500 sm:text-base">
                Enter your email address and we will generate a temporary link so you can choose a new password.
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

            {successMessage ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{successMessage}</span>
                </div>
                <p className="text-slate-700">
                  Check your inbox and spam folder for the reset email, then open the link there to continue.
                </p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <InputField
                label="Email address"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="aarav.sharma@example.in"
                required
                icon={Icons.mail}
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {submitting ? 'Preparing reset link...' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Remembered your password?{' '}
              <Link to="/login" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
                Back to sign in
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
