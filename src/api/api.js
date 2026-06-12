import axios from 'axios';

// Update this to point to your live worker endpoint
const baseURL = import.meta.env.VITE_API_URL || 'https://arising.danreech83.workers.dev/api/v1';

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;