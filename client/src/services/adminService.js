import api from './api';

export function getAdminUsers() {
  return api.get('/admin/users').then((response) => response.data);
}

export function getAdminAnalytics() {
  return api.post('/admin/reports').then((response) => response.data);
}

export function updateAdminUserRole(userId, role) {
  return api.put(`/admin/users/${userId}`, { role }).then((response) => response.data.user);
}
