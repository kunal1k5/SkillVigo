import crypto from 'crypto';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10,15}$/;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return fallback;
}

export function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

export function normalizePhone(value) {
  const digitsOnly = normalizeString(value).replace(/\D/g, '');
  return digitsOnly;
}

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

export function isValidPhone(phone) {
  return PHONE_PATTERN.test(phone);
}

export function createOtpCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashOtpCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

export function getOtpTtlMinutes() {
  return parsePositiveInteger(process.env.OTP_TTL_MINUTES, 10);
}

export function getOtpTtlMs() {
  return getOtpTtlMinutes() * 60 * 1000;
}

export function getOtpResendCooldownSeconds() {
  return parsePositiveInteger(process.env.OTP_RESEND_COOLDOWN_SECONDS, 60);
}

export function getOtpResendCooldownMs() {
  return getOtpResendCooldownSeconds() * 1000;
}

export function buildOtpExpiryDate() {
  return new Date(Date.now() + getOtpTtlMs());
}

export function shouldExposeOtpInResponse() {
  return parseBoolean(process.env.OTP_INCLUDE_IN_RESPONSE, process.env.NODE_ENV !== 'production');
}

export function isPhoneOtpEnabled() {
  return parseBoolean(process.env.PHONE_OTP_ENABLED, true);
}

export function isEmailVerified(user) {
  if (!normalizeEmail(user?.email)) {
    return true;
  }

  return user?.emailVerified !== false;
}

export function requiresPhoneVerification(user) {
  if (!isPhoneOtpEnabled()) {
    return false;
  }

  return Boolean(normalizePhone(user?.phone));
}

export function isPhoneVerified(user) {
  if (!requiresPhoneVerification(user)) {
    return true;
  }

  return user?.phoneVerified !== false;
}

export function isUserFullyVerified(user) {
  return isEmailVerified(user) && isPhoneVerified(user);
}

export function getPendingVerificationChannels(user) {
  const channels = [];

  if (!isEmailVerified(user)) {
    channels.push('email');
  }

  if (!isPhoneVerified(user)) {
    channels.push('phone');
  }

  return channels;
}

export function getVerificationSummary(user) {
  return {
    email: {
      required: Boolean(normalizeEmail(user?.email)),
      verified: isEmailVerified(user),
    },
    phone: {
      required: requiresPhoneVerification(user),
      verified: isPhoneVerified(user),
    },
    pendingChannels: getPendingVerificationChannels(user),
  };
}

export function isOtpResendOnCooldown(lastSentAt) {
  if (!lastSentAt) {
    return false;
  }

  return Date.now() - new Date(lastSentAt).getTime() < getOtpResendCooldownMs();
}

export function getOtpResendRetrySeconds(lastSentAt) {
  if (!lastSentAt) {
    return 0;
  }

  const remainingMs = getOtpResendCooldownMs() - (Date.now() - new Date(lastSentAt).getTime());
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}
