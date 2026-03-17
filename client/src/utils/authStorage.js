export const AUTH_STORAGE_KEY = 'skillvigo_token';
export const AUTH_CLEARED_EVENT = 'skillvigo:auth-cleared';

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) || '';
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function emitAuthCleared() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
}
