import api from './api';

export function getDashboardData() {
  return api.get('/dashboard').then((response) => response.data.dashboard || response.data);
}
