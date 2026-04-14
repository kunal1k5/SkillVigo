export const PENDING_VERIFICATION_STORAGE_KEY = 'skillvigo_pending_verification';

export function getPendingVerification() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(PENDING_VERIFICATION_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export function setPendingVerification(value) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(PENDING_VERIFICATION_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(PENDING_VERIFICATION_STORAGE_KEY, JSON.stringify(value));
}

export function clearPendingVerification() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PENDING_VERIFICATION_STORAGE_KEY);
}
