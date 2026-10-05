import axios from 'axios';
const baseInput = import.meta.env.VITE_API_URL|| "https://dimar.pythonanywhere.com";
const cleanBase = baseInput.replace(/\/$/, '');
const API_BASE_URL = cleanBase.includes('/api/v1') ? `${cleanBase}/` : `${cleanBase}/api/v1/`;

const api = axios.create({
  baseURL: API_BASE_URL, // Enforces exactly: 'https://dimar.pythonanywhere.com/api/v1/'
  headers: {
    'Content-Type': 'application/json',
  },
});

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