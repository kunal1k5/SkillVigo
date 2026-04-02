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

    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong while talking to the server.';

    return Promise.reject(new Error(message));
  },
);

export default api;
