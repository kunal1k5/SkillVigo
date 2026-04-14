import axios from 'axios';
import {
  clearAuthToken,
  emitAuthCleared,
  getAuthToken,
} from '../utils/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      emitAuthCleared();
    }

    const serverMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      '';
    const details = Array.isArray(error.response?.data?.details)
      ? error.response.data.details.join(' ')
      : '';
    const message =
      [serverMessage, details].filter(Boolean).join(' ') ||
      error.message ||
      'Something went wrong while talking to the server.';

    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status || 0;
    normalizedError.data = error.response?.data || null;
    normalizedError.originalError = error;

    return Promise.reject(normalizedError);
  },
);

export default api;
