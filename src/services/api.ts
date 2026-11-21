import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ploty_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 Unauthorized cleanly without redirect loops
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage =
        pathname.startsWith('/login') || pathname.startsWith('/register');

      try {
        localStorage.removeItem('ploty_token');
        localStorage.removeItem('ploty_user');
      } catch {
        // Ignore storage errors in restricted environments
      }

      if (typeof window !== 'undefined' && !isAuthPage) {
        window.dispatchEvent(new CustomEvent('ploty:unauthorized'));
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

export default api;
