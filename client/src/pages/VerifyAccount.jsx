import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import useAuth from '../hooks/useAuth';
import { getDefaultRouteForRole } from '../utils/authRedirect';

function maskEmail(email = '') {
  const [localPart, domain] = String(email).split('@');

  if (!localPart || !domain) {
    return email;
  }

  if (localPart.length <= 2) {
    return `${localPart[0] || ''}*@${domain}`;
  }

  return `${localPart.slice(0, 2)}${'*'.repeat(Math.max(localPart.length - 2, 2))}@${domain}`;
}

function maskPhone(phone = '') {
  const trimmedPhone = String(phone || '').trim();

  if (trimmedPhone.length <= 4) {
    return trimmedPhone;
  }

  return `${trimmedPhone.slice(0, 2)}${'*'.repeat(Math.max(trimmedPhone.length - 4, 4))}${trimmedPhone.slice(-2)}`;
}

const CHANNEL_META = {
  email: {
    contactLabel: 'email',
    mask: maskEmail,
  },
  phone: {
    contactLabel: 'phone number',
    mask: maskPhone,
  },
};

function OtpInput({ label, value, onChange, placeholder }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode="numeric"
        maxLength={6}
        className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-[15px] tracking-[0.28em] text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:bg-emerald-50/30"
      />
    </label>
  );
}

function ChannelCard({
  channel,
  contactLabel,
  contactValue,
  otpValue,
  onOtpChange,
  onVerify,
  onResend,
  authBusy,
  verificationDetails,
}) {
  const isVerified = Boolean(verificationDetails?.verified);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            {channel} verification
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            {isVerified ? 'Verified successfully' : `Verify your ${channel}`}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isVerified
              ? `This ${channel} is already verified on your account.`
              : `Enter the OTP sent to ${contactLabel} ${contactValue}.`}
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            isVerified
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>

      {!isVerified ? (
        <>
          <div className="mt-5">
            <OtpInput
              label={`${channel[0].toUpperCase()}${channel.slice(1)} OTP`}
              value={otpValue}
              onChange={onOtpChange}
              placeholder="000000"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onVerify}
              disabled={authBusy}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Verify {channel}
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={authBusy}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Resend OTP
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default function VerifyAccount() {
  const navigate = useNavigate();
  const {
    authBusy,
    pendingVerification,
    verifyOtp,
    resendVerificationOtp,
    clearPendingVerification,
  } = useAuth();
  const [otpValues, setOtpValues] = useState({
    email: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const verificationContext = pendingVerification;
  const verificationUser = verificationContext?.user || null;
  const verification = verificationContext?.verification || null;
  const pendingChannels = verification?.pendingChannels || [];
  const verificationChannels = useMemo(
    () => ['email', 'phone'].filter((channel) => Boolean(verification?.[channel]?.required)),
    [verification],
  );

  const nextPath = useMemo(() => {
    if (!verificationUser) {
      return '/login';
    }

    return verificationContext?.redirectTo || getDefaultRouteForRole(verificationUser.role);
  }, [verificationContext?.redirectTo, verificationUser]);

  const handleOtpChange = (channel) => (event) => {
    const normalizedValue = event.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpValues((currentValue) => ({
      ...currentValue,
      [channel]: normalizedValue,
    }));
  };

  const handleVerify = async (channel) => {
    setError('');
    setMessage('');

    if (!verificationUser) {
      setError('Start from register or login before verifying an OTP.');
      return;
    }

    if (otpValues[channel].length !== 6) {
      setError('OTP must contain exactly 6 digits.');
      return;
    }

    try {
      const payload = {
        channel,
        otp: otpValues[channel],
      };

      if (channel === 'email') {
        payload.email = verificationUser.email;
      } else {
        payload.phone = verificationUser.phone;
      }

      const response = await verifyOtp(payload);

      setOtpValues((currentValue) => ({
        ...currentValue,
        [channel]: '',
      }));
      setMessage(response.message);

      if (!response.verificationRequired) {
        navigate(nextPath, { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleResend = async (channel) => {
    setError('');
    setMessage('');

    if (!verificationUser) {
      setError('Start from register or login before requesting a fresh OTP.');
      return;
    }

    try {
      const payload = { channel };

      if (channel === 'email') {
        payload.email = verificationUser.email;
      } else {
        payload.phone = verificationUser.phone;
      }

      const response = await resendVerificationOtp(payload);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (!verificationUser || !verification) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_42%,#f8fafc_100%)] font-sans text-slate-900">
        <Navbar />
        <main className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
          <section className="mx-auto max-w-3xl rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-soft backdrop-blur">
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-amber-700">
              Verification needed
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-slate-900">
              No active verification flow found.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Start from register or login first. Once the backend asks for OTP verification, we will bring you back here automatically.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Back to login
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_24%,#f8fafc_100%)] font-sans text-slate-900">
      <Navbar />

      <main className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-cyan-200/60 bg-[linear-gradient(180deg,#ecfeff_0%,#ffffff_100%)] px-7 py-8 shadow-soft sm:px-9 sm:py-10">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="relative space-y-7">
              <div>
                <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 shadow-sm">
                  Secure setup
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                  Verify your account before the first sign-in.
                </h1>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  We have prepared OTP verification for your required contact channels so one person cannot reuse the same details across multiple accounts.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Verification summary</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>
                    Email: <span className="font-semibold text-slate-900">{maskEmail(verificationUser.email)}</span>
                  </p>
                  {verification?.phone?.required ? (
                    <p>
                      Phone: <span className="font-semibold text-slate-900">{maskPhone(verificationUser.phone)}</span>
                    </p>
                  ) : null}
                  <p>
                    Pending steps:{' '}
                    <span className="font-semibold text-slate-900">
                      {pendingChannels.length ? pendingChannels.join(', ') : 'none'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-900 bg-slate-900 p-5 text-slate-50 shadow-lg shadow-slate-900/10">
                <p className="text-sm font-semibold text-white">Need a fresh start?</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  You can clear this pending verification session and go back to login or register at any time.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearPendingVerification();
                    navigate('/login', { replace: true });
                  }}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Clear and return to login
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="space-y-2">
              <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-700">
                OTP verification
              </span>
              <h2 className="font-display text-3xl font-bold text-slate-900">Enter your codes</h2>
              <p className="text-sm leading-6 text-slate-500 sm:text-base">
                Finish these quick checks once, then we will send you straight to the right area for your account.
              </p>
            </div>

            {verificationContext?.message ? (
              <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
                {verificationContext.message}
              </div>
            ) : null}

            {message ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-7 space-y-5">
              {verificationChannels.map((channel) => {
                const channelMeta = CHANNEL_META[channel];

                return (
                  <ChannelCard
                    key={channel}
                    channel={channel}
                    contactLabel={channelMeta.contactLabel}
                    contactValue={channelMeta.mask(verificationUser[channel])}
                    otpValue={otpValues[channel]}
                    onOtpChange={handleOtpChange(channel)}
                    onVerify={() => handleVerify(channel)}
                    onResend={() => handleResend(channel)}
                    authBusy={authBusy}
                    verificationDetails={verification[channel]}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
