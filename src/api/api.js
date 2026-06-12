import axios from 'axios';

// Fallback to local Django port if the environment variable isn't set
const baseURL = import.meta.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: baseURL,
});

// Automatically add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;