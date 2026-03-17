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
