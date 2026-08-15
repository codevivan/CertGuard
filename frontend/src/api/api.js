import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('certguard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('certguard_token');
      localStorage.removeItem('certguard_user');
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        !window.location.pathname.startsWith('/verify')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
