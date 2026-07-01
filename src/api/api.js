import axios from 'axios';

// Vite automatically selects the correct VITE_API_URL based on the environment
const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Clean the URL and ensure the /api/v1/ suffix
const cleanBase = rawUrl.replace(/\/$/, '');
const API_BASE_URL = `${cleanBase}/api/v1/`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default api;