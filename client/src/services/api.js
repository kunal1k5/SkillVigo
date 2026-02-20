/**
 * Axios API Instance
 * 
 * Configuration:
 * - Base URL: Backend API
 * - Headers: Include Firebase ID token
 * - Interceptors: Handle errors, refresh token
 * 
 * Usage:
 * import api from '@/services/api';
 * api.get('/skills')
 */

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   timeout: 10000,
// });
//
// api.interceptors.request.use(async (config) => {
//   // Add Firebase token to headers
// });
//
// export default api;
