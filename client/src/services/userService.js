import api from './api';

export function getCurrentUserProfile() {
  return api.get('/users/me').then((response) => response.data.user);
}

export function updateCurrentUserProfile(profileData) {
  return api.put('/users/me', profileData).then((response) => response.data.user);
}

export function getUserSkills(userId) {
  return api.get(`/users/${userId}/skills`).then((response) => response.data);
}

export function getUserReviews(userId) {
  return api.get(`/users/${userId}/reviews`).then((response) => response.data);
}
