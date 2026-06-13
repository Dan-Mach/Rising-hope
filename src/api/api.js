import axios from 'axios';

// Fall back to your live PythonAnywhere backend if the VITE environment variable isn't injected
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dimar.pythonanywhere.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach your authentication token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // or wherever you store your DRF token
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