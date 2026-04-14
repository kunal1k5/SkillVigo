import api from './api';

export function registerUser(payload) {
  return api.post('/auth/register', payload).then((response) => response.data);
}

export function loginUser(payload) {
  return api.post('/auth/login', payload).then((response) => response.data);
}

export function getCurrentUser() {
  return api.get('/auth/me').then((response) => response.data);
}

export function resendVerificationOtp(payload) {
  return api.post('/auth/resend-verification-otp', payload).then((response) => response.data);
}

export function verifyOtp(payload) {
  return api.post('/auth/verify-otp', payload).then((response) => response.data);
}

export function requestPasswordReset(payload) {
  return api.post('/auth/forgot-password', payload).then((response) => response.data);
}

export function resetPassword(token, payload) {
  return api.post(`/auth/reset-password/${token}`, payload).then((response) => response.data);
}
