import axios from 'axios';

// 1. Keep your base fallback URL matching your core API prefix path
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dimar.pythonanywhere.com/api/v1';

const api = axios.create({
  // 2. CHANGE THIS LINE: Dynamically ensure a trailing slash is ALWAYS appended 
  // to the baseURL regardless of how VITE_API_URL is formatted in your .env file
  baseURL: API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach your authentication token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;